import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 z-30"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-300">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              className="p-1.5 -ml-1.5 rounded hover:bg-slate-100 active:bg-slate-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <span className="ml-3 text-sm font-medium text-slate-900">notebook</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
        <footer className="max-w-3xl mx-auto px-6 py-10 text-xs text-slate-500">
          lab notebook
        </footer>
      </div>
    </div>
  );
}
