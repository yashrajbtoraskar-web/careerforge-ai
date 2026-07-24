import { FileText, Search, Wand2, Send, Radar } from "lucide-react";

const ICONS = { resume: FileText, scout: Search, tailor: Wand2, apply: Send, tracker: Radar };

export default function AgentRelay({ steps, activeIndex = -1, compact = false }) {
  return (
    <div className="relative">
      <div className={`grid grid-cols-5 gap-2 ${compact ? "" : "sm:gap-4"}`}>
        {steps.map((step, i) => {
          const Icon = ICONS[step.key] || FileText;
          const isDone = activeIndex > i;
          const isActive = activeIndex === i;
          return (
            <div key={step.key} className="flex flex-col items-center text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all sm:h-14 sm:w-14
                  ${isActive ? "border-ember bg-ember/10 shadow-ember" : isDone ? "border-teal bg-teal/10" : "border-line bg-surface2"}`}
              >
                <Icon
                  size={compact ? 18 : 22}
                  className={isActive ? "text-ember animate-pulseDot" : isDone ? "text-teal" : "text-slate"}
                />
              </div>
              {!compact && (
                <span className={`mt-2 text-[11px] font-mono uppercase tracking-wide ${isActive ? "text-ember" : isDone ? "text-teal" : "text-slate"}`}>
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute left-[10%] right-[10%] top-6 -z-10 h-px bg-line sm:top-7" />
    </div>
  );
}
