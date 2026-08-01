export default function Logo({ size = 32, withText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#1C1B1F" />
        <path d="M18 40L32 16L46 40" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 34H41" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="48" r="3.5" fill="#6366F1" />
      </svg>
      {withText && (
        <span className="font-display text-lg font-semibold tracking-tight text-mist">
          CareerForge<span className="text-ember">AI</span>
        </span>
      )}
    </div>
  );
}
