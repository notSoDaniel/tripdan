import Logo from './Logo';

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
  return (
    <header className="relative bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 pt-12 pb-6 overflow-hidden">
      <Clouds />
      <div className="relative z-10 flex items-center gap-3 mb-3">
        <Logo size={36} />
        <span className="text-white font-black text-xl tracking-widest uppercase">TRIPDAN</span>
      </div>
      <div className="relative z-10">{children}</div>
    </header>
  );
}
