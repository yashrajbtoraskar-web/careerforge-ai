import { Link } from "react-router-dom";
import { Clock, Inbox } from "lucide-react";
import { useStore } from "../context/StoreContext";

const STAGES = ["Submitted", "Under Review", "Interview", "Offer"];

export default function Applications() {
  const { applications } = useStore();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <span className="eyebrow">Tracker Agent</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-mist">Your applications</h1>
      <p className="mt-2 text-sm text-slate">
        Every application submitted through the pipeline shows up here. Status updates automatically
        as the employer/admin reviews your application — no action needed from you.
      </p>

      {applications.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-3 p-14 text-center">
          <Inbox size={28} className="text-slate" />
          <p className="text-slate">No applications yet.</p>
          <Link to="/jobs" className="btn-ember mt-2">
            Browse open roles
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {applications.map((app) => {
            const idx = STAGES.indexOf(app.stage);
            const lastUpdate = app.history?.[app.history.length - 1]?.at ?? app.createdAt;
            return (
              <div key={app.id} className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold text-mist">{app.title}</h3>
                    <p className="text-sm text-slate">
                      {app.company} · {app.city}
                    </p>
                  </div>
                  <span className="rounded-full bg-ember/10 px-2.5 py-1 text-xs font-semibold text-ember">
                    {app.matchScore}% match
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between">
                    {STAGES.map((s, i) => (
                      <span
                        key={s}
                        className={`text-[11px] font-mono uppercase tracking-wide ${
                          i <= idx ? "text-teal" : "text-slate"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                    <div
                      className="h-full rounded-full bg-teal transition-all"
                      style={{ width: `${((idx + 1) / STAGES.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-slate">
                    Submitted {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <span className="flex items-center gap-1.5 text-xs text-slate">
                    <Clock size={13} /> Last updated {new Date(lastUpdate).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
