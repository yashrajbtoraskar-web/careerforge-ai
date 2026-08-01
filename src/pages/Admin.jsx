import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Briefcase, Send, ShieldCheck, Search, Video } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { ALL_JOBS } from "../data/jobs";

const STAGE_STYLES = {
  Submitted: "bg-slate/10 text-slate",
  "Under Review": "bg-teal/10 text-teal",
  Interview: "bg-ember/10 text-ember",
  Offer: "bg-emerald-500/10 text-emerald-600",
  Rejected: "bg-red-500/10 text-red-600",
};

// The buttons shown per row in the admin table. Each maps to a stage the admin can set directly.
const ADMIN_ACTIONS = [
  { stage: "Under Review", label: "Review", style: "hover:border-teal hover:text-teal" },
  { stage: "Interview", label: "Interview", style: "hover:border-ember hover:text-ember" },
  { stage: "Offer", label: "Offer", style: "hover:border-emerald-500 hover:text-emerald-600" },
  { stage: "Rejected", label: "Reject", style: "hover:border-red-500 hover:text-red-600" },
];

export default function Admin() {
  const { adminStats, session, allApplications, setApplicationStage, STAGES, TERMINAL_STAGES, registeredUsers } = useStore();
  const allStages = [...STAGES, ...TERMINAL_STAGES];
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [showUsers, setShowUsers] = useState(false);

  const byType = {};
  ALL_JOBS.forEach((j) => (byType[j.type] = (byType[j.type] || 0) + 1));
  const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }));

  const byMode = {};
  ALL_JOBS.forEach((j) => (byMode[j.mode] = (byMode[j.mode] || 0) + 1));
  const modeData = Object.entries(byMode).map(([name, value]) => ({ name, value }));

  const filtered = allApplications.filter((a) => {
    const matchesQuery =
      !query ||
      a.userName?.toLowerCase().includes(query.toLowerCase()) ||
      a.userEmail?.toLowerCase().includes(query.toLowerCase()) ||
      a.title?.toLowerCase().includes(query.toLowerCase()) ||
      a.company?.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stageFilter === "All" || a.stage === stageFilter;
    return matchesQuery && matchesStage;
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <span className="eyebrow">Admin console</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-mist">Platform overview</h1>
      <p className="mt-2 text-sm text-slate">Signed in as {session?.email} — full read and update access to platform activity.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <button
          onClick={() => setShowUsers((v) => !v)}
          className="card flex items-center gap-4 p-5 text-left transition-shadow hover:shadow-ember"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember/10">
            <Users size={20} className="text-ember" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-mist">{adminStats.totalUsers}</p>
            <p className="text-xs text-slate">Registered users · tap to {showUsers ? "hide" : "view"}</p>
          </div>
        </button>
        <Link to="/jobs" className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-ember">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal/10">
            <Briefcase size={20} className="text-teal" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-mist">{adminStats.totalJobs.toLocaleString()}</p>
            <p className="text-xs text-slate">Live job listings</p>
          </div>
        </Link>
        <a href="#all-applications" className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-ember">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember/10">
            <Send size={20} className="text-ember" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-mist">{adminStats.totalApplications}</p>
            <p className="text-xs text-slate">Applications submitted</p>
          </div>
        </a>
      </div>

      {showUsers && (
        <div className="card mt-6 p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-mist">Registered users</h3>
          {registeredUsers.length === 0 ? (
            <p className="text-sm text-slate">No candidates have signed up yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slate">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Email</th>
                    <th className="py-2 pr-3 font-medium">Applications</th>
                    <th className="py-2 pr-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-line/60">
                      <td className="py-2.5 pr-3 font-medium text-mist">{u.name}</td>
                      <td className="py-2.5 pr-3 text-slate">{u.email}</td>
                      <td className="py-2.5 pr-3 text-mist">
                        {allApplications.filter((a) => a.userId === u.id).length}
                      </td>
                      <td className="py-2.5 pr-3 text-slate">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Every candidate's applications, visible only to admin */}
      <div id="all-applications" className="card mt-8 scroll-mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-mist">All candidate applications</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidate, email, role..."
                className="input-field !py-2 !pl-8 text-sm sm:w-64"
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="input-field !py-2 text-sm sm:w-40"
            >
              <option value="All">All stages</option>
              {allStages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate">No applications match this filter yet.</p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-slate">
                  <th className="py-3 pr-3 font-medium">Candidate</th>
                  <th className="py-3 pr-3 font-medium">Role applied</th>
                  <th className="py-3 pr-3 font-medium">Match</th>
                  <th className="py-3 pr-3 font-medium">Applied on</th>
                  <th className="py-3 pr-3 font-medium">Status</th>
                  <th className="py-3 pr-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-line/60">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-mist">{a.userName}</p>
                      <p className="text-xs text-slate">{a.userEmail}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-mist">{a.title}</p>
                      <p className="text-xs text-slate">
                        {a.company} · {a.city}
                      </p>
                    </td>
                    <td className="py-3 pr-3 text-mist">{a.matchScore}%</td>
                    <td className="py-3 pr-3 text-slate">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STAGE_STYLES[a.stage] || "bg-slate/10 text-slate"}`}>
                        {a.stage}
                      </span>
                      {a.stage === "Interview" && a.interviewRoomId && (
                        <Link
                          to={`/interview/${a.id}`}
                          className="mt-1.5 flex w-fit items-center gap-1 text-xs font-semibold text-ember hover:underline"
                        >
                          <Video size={12} /> Join interview
                        </Link>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1.5">
                        {ADMIN_ACTIONS.map((act) => (
                          <button
                            key={act.stage}
                            onClick={() => setApplicationStage(a.id, act.stage)}
                            disabled={a.stage === act.stage}
                            className={`rounded-md border border-line px-2.5 py-1 text-xs font-medium text-slate transition-colors disabled:cursor-default disabled:opacity-40 ${act.style}`}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-4 text-xs text-slate">
          Changing a candidate's status here updates their dashboard and tracker automatically — they don't need to do anything on their end.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-mist">Listings by employment type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD5" vertical={false} />
                <XAxis dataKey="name" stroke="#6B6A72" fontSize={12} />
                <YAxis stroke="#6B6A72" fontSize={12} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E4DFD5", borderRadius: 8, color: "#1C1B1F" }} />
                <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-mist">Listings by work mode</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD5" vertical={false} />
                <XAxis dataKey="name" stroke="#6B6A72" fontSize={12} />
                <YAxis stroke="#6B6A72" fontSize={12} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E4DFD5", borderRadius: 8, color: "#1C1B1F" }} />
                <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-8 flex items-center gap-3 p-6">
        <ShieldCheck size={20} className="text-teal" />
        <p className="text-sm text-slate">
          This console currently reads local demo data for the prototype. In a production deployment,
          this view would be backed by a real database and authenticated API layer instead of browser storage.
        </p>
      </div>
    </div>
  );
}
