'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { StudentData } from '@/types';

interface StudentContextType {
  data: StudentData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const StudentContext = createContext<StudentContextType>({
  data: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export function useStudent() {
  return useContext(StudentContext);
}

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/me');
      if (res.status === 401) {
        window.location.replace('/login');
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? '데이터를 불러오지 못했어요.');
      }
      const json = await res.json();
      setData(json.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <StudentContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      {children}
    </StudentContext.Provider>
  );
}
