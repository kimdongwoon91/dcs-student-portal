/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Evaluation, GrowthRecord, Project, Counsel } from '@/types';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

interface CacheEntry {
  data: any;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const TTL = 60_000;

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return Promise.resolve(entry.data as T);
  return fn().then(data => {
    cache.set(key, { data, expiresAt: Date.now() + TTL });
    return data;
  });
}

export function invalidateCache(hakbun: string): void {
  Array.from(cache.keys()).forEach(key => {
    if (key.includes(`:${hakbun}`)) cache.delete(key);
  });
}

function props(page: PageObjectResponse): Record<string, any> {
  return page.properties as Record<string, any>;
}

function getTitle(page: PageObjectResponse, key: string): string {
  return props(page)[key]?.title?.[0]?.plain_text ?? '';
}

function getRichText(page: PageObjectResponse, key: string): string {
  return props(page)[key]?.rich_text?.[0]?.plain_text ?? '';
}

function getSelect(page: PageObjectResponse, key: string): string {
  return props(page)[key]?.select?.name ?? '';
}

function getNumber(page: PageObjectResponse, key: string): number {
  return props(page)[key]?.number ?? 0;
}

function getCheckbox(page: PageObjectResponse, key: string): boolean {
  return props(page)[key]?.checkbox ?? false;
}

function getMultiSelect(page: PageObjectResponse, key: string): string[] {
  return props(page)[key]?.multi_select?.map((s: { name: string }) => s.name) ?? [];
}

function getDate(page: PageObjectResponse, key: string): string {
  return props(page)[key]?.date?.start ?? '';
}

const DB_STUDENT = process.env.NOTION_DB_STUDENT ?? 'fa0720157b854804996afde47a615067';
const DB_EVAL = process.env.NOTION_DB_EVAL ?? 'b97e1c3095fc4d0e902afa9846be3444';
const DB_RECORD = process.env.NOTION_DB_RECORD ?? '9a695e717a28412782c89233df76e695';
const DB_PROJECT = process.env.NOTION_DB_PROJECT ?? '916a7322d3474b66a6712d31e3a858ca';
const DB_COUNSEL = process.env.NOTION_DB_COUNSEL ?? 'b1a5dba60eab4dacb5ef90db5c6e4086';

async function queryDS(dbId: string, filter: any, sorts?: any[]): Promise<PageObjectResponse[]> {
  const res = await notion.dataSources.query({
    data_source_id: dbId,
    filter,
    ...(sorts ? { sorts } : {}),
  } as any);
  return res.results.filter((r): r is PageObjectResponse => r.object === 'page');
}

export async function verifyStudent(name: string, hakbun: string): Promise<boolean> {
  const results = await queryDS(DB_STUDENT, {
    and: [
      { property: '학번', rich_text: { equals: hakbun } },
      { property: '성명', title: { equals: name } },
    ],
  });
  return results.length > 0;
}

export interface StudentInfo {
  pageId: string;
  dept: string;
  grade: number;
  classNo: number;
  number: number;
  careerType: string;
  careerHope: string;
  achievement: string;
  achieveLevel: string;
  totalScore: number;
  certStatus: string;
  certName: string;
  needCounsel: boolean;
  observeAreas: string[];
}

export async function getStudent(hakbun: string): Promise<StudentInfo | null> {
  return cached(`student:${hakbun}`, async () => {
    const results = await queryDS(DB_STUDENT, {
      property: '학번',
      rich_text: { equals: hakbun },
    });
    if (!results.length) return null;
    const page = results[0];
    return {
      pageId: page.id,
      dept: getSelect(page, '학과'),
      grade: getNumber(page, '학년'),
      classNo: getNumber(page, '반'),
      number: getNumber(page, '번호'),
      careerType: getSelect(page, '진로대분류'),
      careerHope: getSelect(page, '희망진로'),
      achievement: getSelect(page, '성취도'),
      achieveLevel: getSelect(page, '성취수준'),
      totalScore: getNumber(page, '환산총점'),
      certStatus: getSelect(page, '자격증취득'),
      certName: getRichText(page, '대표자격증'),
      needCounsel: getCheckbox(page, '상담필요'),
      observeAreas: getMultiSelect(page, '관찰영역'),
    };
  });
}

export async function getEvaluations(hakbun: string): Promise<Evaluation[]> {
  return cached(`eval:${hakbun}`, async () => {
    const results = await queryDS(
      DB_EVAL,
      { property: '학번', rich_text: { equals: hakbun } },
      [{ timestamp: 'created_time', direction: 'descending' }]
    );
    return results.map(page => ({
      id: page.id,
      theory: getNumber(page, '이론'),
      practice: getNumber(page, '실기'),
      totalScore: getNumber(page, '환산총점'),
      achievement: getSelect(page, '성취도'),
      achieveLevel: getSelect(page, '성취수준'),
      certStatus: getSelect(page, '자격증취득'),
      dept: getSelect(page, '학과'),
      feedback: getRichText(page, '피드백'),
      createdTime: page.created_time,
    }));
  });
}

export async function getRecords(hakbun: string): Promise<GrowthRecord[]> {
  return cached(`record:${hakbun}`, async () => {
    const results = await queryDS(
      DB_RECORD,
      { property: '학번', rich_text: { equals: hakbun } },
      [{ property: '일자', direction: 'descending' }]
    );
    return results.map(page => ({
      id: page.id,
      date: getDate(page, '일자'),
      content: getRichText(page, '내용'),
      observeArea: getSelect(page, '관찰영역'),
      dept: getSelect(page, '학과'),
    }));
  });
}

export async function getProjects(hakbun: string): Promise<Project[]> {
  return cached(`project:${hakbun}`, async () => {
    const results = await queryDS(DB_PROJECT, {
      property: '학번',
      rich_text: { equals: hakbun },
    });
    return results.map(page => ({
      id: page.id,
      group: getRichText(page, '모둠'),
      role: getSelect(page, '역할'),
      task: getRichText(page, '담당과업'),
      status: getSelect(page, '진행상태'),
      dept: getSelect(page, '학과'),
    }));
  });
}

export async function getCounsels(hakbun: string): Promise<Counsel[]> {
  return cached(`counsel:${hakbun}`, async () => {
    const results = await queryDS(
      DB_COUNSEL,
      { property: '학번', rich_text: { equals: hakbun } },
      [{ property: '상담일', direction: 'descending' }]
    );
    return results.map(page => ({
      id: page.id,
      title: getTitle(page, '제목'),
      type: getSelect(page, '상담유형'),
      content: getRichText(page, '상담내용'),
      date: getDate(page, '상담일'),
      followUp: getRichText(page, '후속조치'),
    }));
  });
}

export async function createCounselRequest(
  hakbun: string,
  type: string,
  content: string,
  studentPageId: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await notion.pages.create({
    parent: { data_source_id: DB_COUNSEL } as any,
    properties: {
      '제목': { title: [{ text: { content: `[신청] ${type} 상담` } }] },
      '학번': { rich_text: [{ text: { content: hakbun } }] },
      '상담유형': { select: { name: type } },
      '상담내용': { rich_text: [{ text: { content } }] },
      '상담일': { date: { start: today } },
      '학생': { relation: [{ id: studentPageId }] },
    } as any,
  });
  invalidateCache(hakbun);
}
