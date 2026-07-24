import { Link } from "react-router-dom";
import { MapPin, Briefcase, IndianRupee } from "lucide-react";

export default function JobCard({ job, score }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card group flex flex-col gap-3 p-5 transition-colors hover:border-ember/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-mist group-hover:text-ember">
            {job.title}
          </h3>
          <p className="text-sm text-slate">{job.company}</p>
        </div>
        {typeof score === "number" && (
          <div
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              score >= 60
                ? "bg-teal/10 text-teal"
                : score >= 30
                ? "bg-ember/10 text-ember"
                : "bg-surface2 text-slate"
            }`}
          >
            {score}% match
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate">
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {job.city} · {job.mode}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={13} /> {job.type} · {job.level}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee size={13} /> {job.salaryLPA}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.skills.map((s) => (
          <span key={s} className="tag-pill">
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}
