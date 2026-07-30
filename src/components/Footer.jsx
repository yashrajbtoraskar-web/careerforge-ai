import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
        <Logo size={26} />
        <p className="text-center text-xs text-slate">
          Built by Yash & Prerna as a final year project — a demonstration of autonomous multi-agent architecture applied to job search.
        </p>
        <p className="text-xs text-slate">© {new Date().getFullYear()} CareerForge AI</p>
      </div>
    </footer>
  );
}
