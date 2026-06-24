import DataProvider from '@/components/DataProvider';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}
