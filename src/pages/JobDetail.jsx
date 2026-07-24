import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Briefcase, IndianRupee, CalendarDays, CheckCircle2 } from "lucide-react";
import { ALL_JOBS, matchScore } from "../data/jobs";
import { useStore } from "../context/StoreContext";
import AgentRelay from "../components/AgentRelay";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = ALL_JOBS.find((j) => j.id === id);
  const { session, resumeSkills, AGENT_STEPS, createApplication, hasApplied } = useStore();

  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [finished, setFinished] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="text-slate">That listing doesn't exist.</p>
        <Link to="/jobs" className="text-teal hover:underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const score = matchScore(resumeSkills, job.skills);
  const alreadyApplied = session && hasApplied(job.id);

  const runPipeline = () => {
    if (!session) return navigate("/login");
    setRunning(true);
    setFinished(false);
    setLogs([]);
    setStepIndex(0);

    let i = 0;
    const tick = () => {
      if (i >= AGENT_STEPS.length) {
        createApplication(job);
        setRunning(false);
        setFinished(true);
        return;
      }
      const step = AGENT_STEPS[i];
      setStepIndex(i);
      setLogs((prev) => [...prev, `[${step.label}] ${step.verb}…`]);
      i += 1;
      setTimeout(tick, 850);
    };
    tick();
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <Link to="/jobs" className="text-xs text-slate hover:text-teal">
        ← Back to all roles
      </Link>

      <div className="card mt-4 p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-mist sm:text-3xl">{job.title}</h1>
            <p className="mt-1 text-slate">{job.company}</p>
          </div>
          <div
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              score >= 60 ? "bg-teal/10 text-teal" : score >= 30 ? "bg-ember/10 text-ember" : "bg-surface2 text-slate"
            }`}
          >
            {resumeSkills?.length ? `${score}% match` : "Add resume for match score"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate">
          <span className="flex items-center gap-1.5">
            <MapPin size={15} /> {job.city} · {job.mode}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase size={15} /> {job.type} · {job.level}
          </span>
          <span className="flex items-center gap-1.5">
            <IndianRupee size={15} /> {job.salaryLPA}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays size={15} /> Posted {job.postedDaysAgo === 0 ? "today" : `${job.postedDaysAgo}d ago`}
          </span>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate">{job.description}</p>

        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Required skills</p>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => {
              const have = resumeSkills?.some((r) => r.toLowerCase() === s.toLowerCase());
              return (
                <span
                  key={s}
                  className={`tag-pill ${have ? "border-teal/60 bg-teal/10 text-teal" : ""}`}
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-7">
          {alreadyApplied || finished ? (
            <div className="flex items-center gap-2 rounded-lg border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
              <CheckCircle2 size={17} /> Application submitted — track its progress from your Applications page.
            </div>
          ) : (
            <button onClick={runPipeline} disabled={running} className="btn-ember disabled:opacity-60">
              {running ? "Running agent pipeline…" : "Run agent pipeline & apply"}
            </button>
          )}

          {(running || logs.length > 0) && (
            <div className="mt-6">
              <AgentRelay steps={AGENT_STEPS} activeIndex={finished ? AGENT_STEPS.length : stepIndex} />
              <div className="mt-5 rounded-lg border border-line bg-surface2 p-4 font-mono text-xs text-slate">
                {logs.map((l, idx) => (
                  <p key={idx} className={idx === logs.length - 1 && running ? "text-teal" : ""}>
                    {l}
                  </p>
                ))}
                {finished && <p className="text-ember">[Application Agent] Submission complete. Tracker Agent is now monitoring status.</p>}
                <div ref={logEndRef} />
              </div>
              {finished && (
                <Link to="/applications" className="btn-ghost mt-5">
                  View in Applications
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
