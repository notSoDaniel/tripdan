import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

function Clouds() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      viewBox="0 0 400 140"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="60" cy="50" rx="50" ry="28" fill="white" />
      <ellipse cx="90" cy="40" rx="35" ry="22" fill="white" />
      <ellipse cx="35" cy="55" rx="28" ry="18" fill="white" />

      <ellipse cx="230" cy="30" rx="60" ry="30" fill="white" />
      <ellipse cx="265" cy="20" rx="40" ry="22" fill="white" />
      <ellipse cx="200" cy="38" rx="32" ry="20" fill="white" />

      <ellipse cx="360" cy="80" rx="45" ry="24" fill="white" />
      <ellipse cx="385" cy="68" rx="28" ry="18" fill="white" />
      <ellipse cx="338" cy="85" rx="26" ry="16" fill="white" />

      <ellipse cx="130" cy="110" rx="38" ry="20" fill="white" />
      <ellipse cx="155" cy="100" rx="26" ry="16" fill="white" />
    </svg>
  );
}

export default function AppHeader({ children }) {
  const { email, logout } = useAuth();
  const initial = email ? email[0].toUpperCase() : '?';
  const username = email ? email.split('@')[0] : '';

  return (
    <header className="relative bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 pt-12 pb-6 overflow-hidden">
      <Clouds />
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="text-white font-black text-xl tracking-widest uppercase">TRIPDAN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-2.5 py-1.5">
            <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              {initial}
            </div>
            <span className="text-xs text-blue-100 max-w-[72px] truncate">{username}</span>
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </button>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </header>
  );
}
