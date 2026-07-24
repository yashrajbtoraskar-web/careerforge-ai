import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Briefcase, Send, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { ALL_JOBS } from "../data/jobs";

export default function Admin() {
  const { adminStats, session, allApplications, updateApplicationStatus } = useStore();

  const byType = {};
  ALL_JOBS.forEach((j) => (byType[j.type] = (byType[j.type] || 0) + 1));
  const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }));

  const byMode = {};
  ALL_JOBS.forEach((j) => (byMode[j.mode] = (byMode[j.mode] || 0) + 1));
  const modeData = Object.entries(byMode).map(([name, value]) => ({ name, value }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <span className="eyebrow">Admin console</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-mist">Platform overview</h1>
      <p className="mt-2 text-sm text-slate">Signed in as {session?.email} — full read access to platform activity.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember/10">
            <Users size={20} className="text-ember" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-mist">{adminStats.totalUsers}</p>
            <p className="text-xs text-slate">Registered users</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal/10">
            <Briefcase size={20} className="text-teal" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-mist">{adminStats.totalJobs.toLocaleString()}</p>
            <p className="text-xs text-slate">Live job listings</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember/10">
            <Send size={20} className="text-ember" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-mist">{adminStats.totalApplications}</p>
            <p className="text-xs text-slate">Applications submitted</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-mist">Listings by employment type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B3542" vertical={false} />
                <XAxis dataKey="name" stroke="#94A0B2" fontSize={12} />
                <YAxis stroke="#94A0B2" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1A2129", border: "1px solid #2B3542", borderRadius: 8, color: "#ECEFF4" }} />
                <Bar dataKey="value" fill="#45D6C6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-mist">Listings by work mode</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B3542" vertical={false} />
                <XAxis dataKey="name" stroke="#94A0B2" fontSize={12} />
                <YAxis stroke="#94A0B2" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1A2129", border: "1px solid #2B3542", borderRadius: 8, color: "#ECEFF4" }} />
                <Bar dataKey="value" fill="#E8873A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-8 p-6">
        <h3 className="mb-1 font-display text-base font-semibold text-mist">Applicants</h3>
        <p className="mb-4 text-sm text-slate">
          Review everyone who applied, then shortlist or reject — the candidate gets notified instantly.
        </p>

        {allApplications.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate">No applications submitted yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {allApplications.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-mist">
                    {app.applicantName || "Unknown applicant"}
                  </p>
                  <p className="text-xs text-slate">{app.applicantEmail}</p>
                  <p className="mt-1 text-xs text-slate">
                    Applied for <span className="text-mist">{app.title}</span> · {app.company} ·{" "}
                    {app.matchScore}% match
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {app.status === "Shortlisted" && (
                    <span className="flex items-center gap-1 rounded-full bg-teal/10 px-3 py-1.5 text-xs font-semibold text-teal">
                      <CheckCircle2 size={13} /> Shortlisted
                    </span>
                  )}
                  {app.status === "Rejected" && (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
                      <XCircle size={13} /> Rejected
                    </span>
                  )}
                  {(!app.status || app.status === "Applied") && (
                    <>
                      <span className="flex items-center gap-1 rounded-full bg-surface2 px-3 py-1.5 text-xs font-semibold text-slate">
                        <Clock size={13} /> Pending
                      </span>
                      <button
                        onClick={() => updateApplicationStatus(app.id, "Shortlisted")}
                        className="btn-ember !px-3 !py-1.5 text-xs"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, "Rejected")}
                        className="btn-ghost !px-3 !py-1.5 text-xs"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-8 flex items-center gap-3 p-6">
        <ShieldCheck size={20} className="text-teal" />
        <p className="text-sm text-slate">
          This console reads local demo data only — no real user data is exposed. In a production
          deployment, this view would call authenticated Spring Boot admin endpoints instead.
        </p>
      </div>
    </div>
  );
}
