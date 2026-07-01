'use strict';

/**
 * 채용공고 수집 스크립트
 *
 * 사용법:
 *   JOBS_API_KEY_1=<인사혁신처키> JOBS_API_KEY_2=<알리오키> node scripts/collect.js
 *
 * 주의: API 응답 필드명은 첫 실행 시 실제 응답을 보고 조정 필요.
 *   --dry-run 플래그로 실제 파일 저장 없이 결과 확인 가능.
 */

const https = require('node:https');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { XMLParser } = require('fast-xml-parser');
const { matchDepartments, matchEducation } = require('./keywords.js');

const DRY_RUN = process.argv.includes('--dry-run');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'jobs.json');

const API_KEY_1 = process.env.JOBS_API_KEY_1 || '';
const API_KEY_2 = process.env.JOBS_API_KEY_2 || '';

// ─────────────────────────────────────────
// 공통 유틸
// ─────────────────────────────────────────

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseXml(xmlString) {
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
  return parser.parse(xmlString);
}

/** YYYY-MM-DD 문자열로 정규화 (YYYYMMDD 또는 YYYY-MM-DD 입력 허용) */
function normalizeDate(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/-/g, '');
  if (s.length !== 8) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/** 오늘보다 지난 마감일이면 true */
function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toISOString().slice(0, 10));
}

// ─────────────────────────────────────────
// ① 인사혁신처 공공취업정보 (나라일터 기반)
// ─────────────────────────────────────────

async function collectNaraIlto() {
  if (!API_KEY_1) {
    console.warn('[나라일터] JOBS_API_KEY_1 미설정 — 건너뜀');
    return [];
  }

  const BASE = 'http://openapi.mpm.go.kr/openapi/service/RetrievePblinsttEmpmnInfoService';
  const PAGE_SIZE = 100;
  const results = [];
  let pageNo = 1;
  let totalCount = Infinity;

  while (results.length < totalCount) {
    const url =
      `${BASE}/getList` +
      `?serviceKey=${encodeURIComponent(API_KEY_1)}` +
      `&pageNo=${pageNo}` +
      `&numOfRows=${PAGE_SIZE}` +
      `&type=xml`;

    console.log(`[나라일터] 페이지 ${pageNo} 요청...`);
    let rawXml;
    try {
      rawXml = await get(url);
    } catch (e) {
      console.error('[나라일터] 요청 실패:', e.message);
      break;
    }

    let parsed;
    try {
      parsed = parseXml(rawXml);
    } catch (e) {
      console.error('[나라일터] XML 파싱 실패:', e.message);
      console.error('응답 원문(앞 500자):', rawXml.slice(0, 500));
      break;
    }

    // 응답 구조: response > body > items > item[]
    const body = parsed?.response?.body;
    if (!body) {
      console.error('[나라일터] 예상과 다른 응답 구조. 원문:', rawXml.slice(0, 500));
      break;
    }

    totalCount = Number(body.totalCount ?? 0);
    const items = body?.items?.item;
    if (!items) break;

    const list = Array.isArray(items) ? items : [items];

    for (const item of list) {
      // ※ 실제 필드명은 API 응답 확인 후 아래를 조정하세요.
      const title = String(item.recrutPbancTtl ?? item.empmnTtl ?? '');
      const orgName = String(item.instNm ?? item.insttNm ?? '');
      const region = String(item.instLclsNm ?? item.areaNm ?? '');
      const qualText = String(item.aplyQlfcCn ?? item.acbgCondCn ?? '');
      const deadline = normalizeDate(item.recrutPbancEndDt ?? item.pbancEndYmd);
      const postedAt = normalizeDate(item.recrutNtsnDt ?? item.pbancBgngYmd);
      const sourceUrl = String(item.pblancUrl ?? item.detailUrl ?? '');
      const positionText = String(item.recrutSeNm ?? item.clsfNm ?? '');

      if (isExpired(deadline)) continue;

      const searchText = [title, qualText, positionText].join(' ');
      const edu = matchEducation(searchText);
      if (edu === '기타') continue;

      const departments = matchDepartments(searchText);
      if (departments.length === 0) continue;

      results.push({
        id: `nara-${item.recrutPbancSeq ?? item.empmnSeq ?? pageNo + '-' + results.length}`,
        title,
        organization: orgName,
        org_type: '지자체',
        region: region || '미상',
        deadline,
        posted_at: postedAt,
        education: edu,
        departments,
        position: positionText,
        source_url: sourceUrl,
      });
    }

    if (list.length < PAGE_SIZE) break;
    pageNo++;
  }

  console.log(`[나라일터] 수집 완료: ${results.length}건`);
  return results;
}

// ─────────────────────────────────────────
// ② 기획재정부 공공기관 채용정보 (알리오 기반)
// ─────────────────────────────────────────

async function collectAlio() {
  if (!API_KEY_2) {
    console.warn('[알리오] JOBS_API_KEY_2 미설정 — 건너뜀');
    return [];
  }

  const BASE = 'https://opendata.alio.go.kr/recruit/list';
  const PAGE_SIZE = 100;
  const results = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url =
      `${BASE}?apiKey=${encodeURIComponent(API_KEY_2)}` +
      `&page=${page}&perPage=${PAGE_SIZE}`;

    console.log(`[알리오] 페이지 ${page} 요청...`);
    let raw;
    try {
      raw = await get(url);
    } catch (e) {
      console.error('[알리오] 요청 실패:', e.message);
      break;
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      // 알리오도 XML일 수 있으므로 시도
      try {
        const parsed = parseXml(raw);
        const items = parsed?.response?.body?.items?.item;
        json = { data: items ? (Array.isArray(items) ? items : [items]) : [] };
      } catch (e) {
        console.error('[알리오] 파싱 실패:', e.message);
        console.error('응답 원문(앞 500자):', raw.slice(0, 500));
        break;
      }
    }

    // ※ 실제 필드명은 API 응답 확인 후 아래를 조정하세요.
    const list = json?.data ?? json?.result ?? json?.list ?? [];
    if (!Array.isArray(list) || list.length === 0) {
      hasMore = false;
      break;
    }

    for (const item of list) {
      const title = String(item.recrutPbancTtl ?? item.title ?? '');
      const orgName = String(item.instNm ?? item.orgNm ?? '');
      const qualText = String(item.aplyQlfcCn ?? item.qualification ?? '');
      const deadline = normalizeDate(item.pbancEndYmd ?? item.deadline);
      const postedAt = normalizeDate(item.pbancBgngYmd ?? item.startDate);
      const sourceUrl = String(item.pblancUrl ?? item.url ?? '');
      const positionText = String(item.recrutSeNm ?? item.position ?? '');

      if (isExpired(deadline)) continue;

      const searchText = [title, qualText, positionText].join(' ');
      const edu = matchEducation(searchText);
      if (edu === '기타') continue;

      const departments = matchDepartments(searchText);
      if (departments.length === 0) continue;

      results.push({
        id: `alio-${item.recrutPbancSeq ?? item.id ?? page + '-' + results.length}`,
        title,
        organization: orgName,
        org_type: '공기업',
        region: String(item.instLclsNm ?? item.region ?? '미상'),
        deadline,
        posted_at: postedAt,
        education: edu,
        departments,
        position: positionText,
        source_url: sourceUrl,
      });
    }

    hasMore = list.length === PAGE_SIZE;
    page++;
  }

  console.log(`[알리오] 수집 완료: ${results.length}건`);
  return results;
}

// ─────────────────────────────────────────
// 메인
// ─────────────────────────────────────────

async function main() {
  console.log('채용공고 수집 시작:', new Date().toISOString());

  const [naraJobs, alioJobs] = await Promise.all([
    collectNaraIlto(),
    collectAlio(),
  ]);

  // 중복 제거: 기관명+공고제목 기준
  const seen = new Set();
  const allJobs = [...naraJobs, ...alioJobs].filter(job => {
    const key = `${job.organization}::${job.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 마감일 오름차순 정렬
  allJobs.sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  });

  const output = {
    collected_at: new Date().toISOString(),
    total: allJobs.length,
    jobs: allJobs,
  };

  if (DRY_RUN) {
    console.log('\n[DRY RUN] 저장하지 않음. 샘플 5건:');
    console.log(JSON.stringify(allJobs.slice(0, 5), null, 2));
  } else {
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`저장 완료: ${OUTPUT_PATH} (총 ${allJobs.length}건)`);
  }
}

main().catch(e => {
  console.error('수집 실패:', e);
  process.exit(1);
});
