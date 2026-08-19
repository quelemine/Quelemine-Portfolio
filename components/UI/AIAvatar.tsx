// components/UI/AIAvatar.tsx
// Friendly waving robot avatar — used as the AI assistant floating button icon.

export default function AIAvatar({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AI Assistant"
    >
      {/* Head */}
      <rect x="16" y="14" width="32" height="26" rx="8" fill="#1E40AF" />

      {/* Antenna */}
      <rect x="30" y="6" width="4" height="10" rx="2" fill="#60A5FA" />
      <circle cx="32" cy="5" r="3" fill="#93C5FD" />

      {/* Eyes */}
      <circle cx="24" cy="25" r="4" fill="white" />
      <circle cx="40" cy="25" r="4" fill="white" />
      <circle cx="25" cy="25" r="2" fill="#1D4ED8" />
      <circle cx="41" cy="25" r="2" fill="#1D4ED8" />
      {/* Eye shine */}
      <circle cx="26" cy="24" r="0.8" fill="white" />
      <circle cx="42" cy="24" r="0.8" fill="white" />

      {/* Smile */}
      <path d="M25 33 Q32 38 39 33" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Body */}
      <rect x="20" y="42" width="24" height="14" rx="5" fill="#1E3A8A" />

      {/* Chest light */}
      <circle cx="32" cy="49" r="3" fill="#3B82F6" opacity="0.8" />

      {/* Left arm (static) */}
      <rect x="10" y="43" width="8" height="4" rx="2" fill="#1E3A8A" />

      {/* Right arm (waving) — rotated up */}
      <g transform="rotate(-45 54 43)">
        <rect x="46" y="41" width="8" height="4" rx="2" fill="#1E3A8A" />
      </g>
      {/* Waving hand */}
      <g transform="rotate(-45 54 43)">
        <circle cx="55" cy="41" r="3.5" fill="#60A5FA" />
      </g>
    </svg>
  );
}
