import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import JobCard from "../components/JobCard";
import { ALL_JOBS, matchScore } from "../data/jobs";
import { useStore } from "../context/StoreContext";

const PAGE_SIZE = 12;

export default function Jobs() {
  const { resumeSkills, session } = useStore();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("All");
  const [sortByMatch, setSortByMatch] = useState(!!resumeSkills?.length);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let jobs = ALL_JOBS.filter((j) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.city.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q));
      const matchesMode = mode === "All" || j.mode === mode;
      return matchesQuery && matchesMode;
    });
    if (sortByMatch && resumeSkills?.length) {
      jobs = [...jobs].sort((a, b) => matchScore(resumeSkills, b.skills) - matchScore(resumeSkills, a.skills));
    }
    return jobs;
  }, [query, mode, sortByMatch, resumeSkills]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = (fn) => (...args) => {
    fn(...args);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Scout Agent · live listings</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-mist">
            {filtered.length.toLocaleString()} open roles
          </h1>
        </div>
        {!session && (
          <p className="text-sm text-slate">
            <a href="/signup" className="text-teal hover:underline">
              Create an account
            </a>{" "}
            to see your match score on every listing.
          </p>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" />
          <input
            className="input-field pl-10"
            placeholder="Search by title, company, city, or skill…"
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
          />
        </div>
        <select
          className="input-field sm:w-44"
          value={mode}
          onChange={(e) => resetPage(setMode)(e.target.value)}
        >
          <option>All</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>On-site</option>
        </select>
        {resumeSkills?.length > 0 && (
          <button
            onClick={() => setSortByMatch((s) => !s)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors sm:w-52 ${
              sortByMatch ? "border-teal bg-teal/10 text-teal" : "border-line text-slate hover:border-slate"
            }`}
          >
            <SlidersHorizontal size={15} /> Sort by match score
          </button>
        )}
      </div>

      {paged.length === 0 ? (
        <div className="card p-10 text-center text-slate">
          No roles match those filters yet. Try a broader search term.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((job) => (
            <JobCard key={job.id} job={job} score={resumeSkills?.length ? matchScore(resumeSkills, job.skills) : undefined} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-ghost !px-3 !py-1.5 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 text-sm text-slate">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost !px-3 !py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
