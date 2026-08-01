import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { FileText, Briefcase, Send, TrendingUp } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { ALL_JOBS, matchScore } from "../data/jobs";

const STAGE_COLORS = { Submitted: "#94A0B2", "Under Review": "#059669", Interview: "#4F46E5", Offer: "#16A34A", Rejected: "#DC2626" };

export default function Dashboard() {
  const { session, resumeSkills, applications } = useStore();

  const strongMatches = ALL_JOBS.filter((j) => matchScore(resumeSkills, j.skills) >= 60).length;

  const stageData = ["Submitted", "Under Review", "Interview", "Offer", "Rejected"].map((stage) => ({
    name: stage,
    value: applications.filter((a) => a.stage === stage).length,
  }));

  const matchBuckets = [
    { name: "0-29%", value: 0 },
    { name: "30-59%", value: 0 },
    { name: "60-79%", value: 0 },
    { name: "80-100%", value: 0 },
  ];
  ALL_JOBS.forEach((j) => {
    const s = matchScore(resumeSkills, j.skills);
    if (s < 30) matchBuckets[0].value++;
    else if (s < 60) matchBuckets[1].value++;
    else if (s < 80) matchBuckets[2].value++;
    else matchBuckets[3].value++;
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <span className="eyebrow">Overview</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-mist">
        Welcome back, {session?.name?.split(" ")[0]}
      </h1>
      <p className="mt-2 text-sm text-slate">Here's what your agent pipeline has been up to.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Skills on file" value={resumeSkills.length} accent="ember" to="/resume" />
        <StatCard icon={TrendingUp} label="Strong matches (60%+)" value={strongMatches} accent="teal" to="/jobs" />
        <StatCard icon={Send} label="Applications sent" value={applications.length} accent="ember" to="/applications" />
        <StatCard
          icon={Briefcase}
          label="In active stages"
          value={applications.filter((a) => a.stage !== "Submitted").length}
          accent="teal"
          to="/applications"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-mist">Applications by stage</h3>
          {applications.length === 0 ? (
            <EmptyChart text="Apply to a role to see your pipeline take shape." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {stageData.map((entry) => (
                      <Cell key={entry.name} fill={STAGE_COLORS[entry.name]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E4DFD5", borderRadius: 8, color: "#1C1B1F" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {stageData.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate">
                <span className="h-2 w-2 rounded-full" style={{ background: STAGE_COLORS[s.name] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-mist">Market fit distribution</h3>
          {resumeSkills.length === 0 ? (
            <EmptyChart text="Upload a resume to see how the live job market fits your skills." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchBuckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4DFD5" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B6A72" fontSize={12} />
                  <YAxis stroke="#6B6A72" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E4DFD5", borderRadius: 8, color: "#1C1B1F" }} />
                  <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link to="/jobs" className="btn-ember">
          Browse matching roles
        </Link>
        <Link to="/resume" className="btn-ghost">
          Update resume skills
        </Link>
        <Link to="/applications" className="btn-ghost">
          View applications
        </Link>
      </div>
    </div>
  );
}

const ACCENTS = {
  ember: { bg: "bg-ember/10", text: "text-ember" },
  teal: { bg: "bg-teal/10", text: "text-teal" },
};

function StatCard({ icon: Icon, label, value, accent, to }) {
  const a = ACCENTS[accent] || ACCENTS.ember;
  return (
    <Link to={to} className="card p-5 transition-shadow hover:shadow-ember">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${a.bg}`}>
        <Icon size={17} className={a.text} />
      </div>
      <p className="text-2xl font-semibold text-mist">{value}</p>
      <p className="text-xs text-slate">{label}</p>
    </Link>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-slate">
      {text}
    </div>
  );
}
