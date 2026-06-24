import { redirect } from 'next/navigation';
import { getSessionHakbun } from '@/lib/session';

export default function RootPage() {
  const hakbun = getSessionHakbun();
  redirect(hakbun ? '/home' : '/login');
}
