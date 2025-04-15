import { useAuth } from "@/hooks/use-auth";
import { Header } from "./header";
import Sidebar from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-2 px-4 sm:px-6 pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}
