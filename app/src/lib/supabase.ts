import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars are not set');
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface StudentAccount {
  id: string;
  hakbun: string;
  name_hash: string;
  password_hash: string;
  nickname: string;
  created_at: string;
}

export async function findAccountByHakbun(hakbun: string): Promise<StudentAccount | null> {
  const { data } = await getClient()
    .from('student_accounts')
    .select('*')
    .eq('hakbun', hakbun)
    .single();
  return data ?? null;
}

export async function findAccountsByNameHash(nameHash: string): Promise<StudentAccount[]> {
  const { data } = await getClient()
    .from('student_accounts')
    .select('*')
    .eq('name_hash', nameHash);
  return data ?? [];
}

export async function createAccount(
  hakbun: string,
  nameHash: string,
  passwordHash: string,
  nickname: string
): Promise<void> {
  const { error } = await getClient()
    .from('student_accounts')
    .insert({ hakbun, name_hash: nameHash, password_hash: passwordHash, nickname });
  if (error) throw new Error(error.message);
}

export async function getNickname(hakbun: string): Promise<string> {
  const { data } = await getClient()
    .from('student_accounts')
    .select('nickname')
    .eq('hakbun', hakbun)
    .single();
  return data?.nickname ?? '';
}
