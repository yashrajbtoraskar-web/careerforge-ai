import { Link } from "react-router-dom";
import { ArrowRight, FileText, Search, Wand2, Send, Radar, ShieldCheck, Gauge, Layers } from "lucide-react";
import AgentRelay from "../components/AgentRelay";
import { ALL_JOBS } from "../data/jobs";

const STEPS = [
  { key: "resume", label: "Resume Agent", verb: "Reads your resume and extracts real, verified skills — no guesswork." },
  { key: "scout", label: "Scout Agent", verb: "Scans live openings and ranks them by how closely they fit your profile." },
  { key: "tailor", label: "Tailor Agent", verb: "Rewrites your summary and bullets so each application speaks to that role." },
  { key: "apply", label: "Application Agent", verb: "Assembles the package and submits it — or queues it for your approval." },
  { key: "tracker", label: "Tracker Agent", verb: "Watches every application and moves it forward as status changes." },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ember-glow">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Autonomous multi-agent career platform</span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-mist sm:text-6xl">
              One resume in. <span className="text-ember">Five agents</span> work the room.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate sm:text-lg">
              CareerForge AI doesn't just answer questions about your resume. It runs a coordinated
              pipeline of specialist agents that find roles, tailor your application, submit it, and
              track it — while you get on with everything else.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup" className="btn-ember">
                Start free <ArrowRight size={16} />
              </Link>
              <Link to="/jobs" className="btn-ghost">
                Browse {ALL_JOBS.length.toLocaleString()}+ live roles
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-line bg-surface/60 p-6 sm:p-10">
            <p className="mb-6 text-center text-xs font-mono uppercase tracking-[0.2em] text-slate">
              The agent relay
            </p>
            <AgentRelay steps={STEPS} activeIndex={2} />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-5 sm:gap-3">
              {STEPS.map((s) => (
                <p key={s.key} className="text-center text-xs leading-relaxed text-slate">
                  {s.verb}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why agents, not a chatbot */}
      <section className="border-t border-line px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <span className="eyebrow">Why this is different</span>
            <h2 className="mt-3 text-3xl font-semibold text-mist sm:text-4xl">
              Most tools answer questions. This one does the work.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={Layers}
              title="Multi-agent, not single-shot"
              body="Five specialist agents hand work to each other in sequence, the way a real team would — not one model guessing an answer in isolation."
            />
            <FeatureCard
              icon={Gauge}
              title="Match score on every listing"
              body="Each opening is scored against your actual extracted skills, so you spend time on roles worth applying to."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="You stay in control"
              body="Review every tailored application before it goes out, or let the pipeline run end to end. Either way, nothing is submitted silently."
            />
          </div>
        </div>
      </section>

      {/* How it works, step by step */}
      <section className="border-t border-line bg-surface/30 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-3 text-3xl font-semibold text-mist sm:text-4xl">Four steps, start to finish</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard n="01" icon={FileText} title="Upload your resume" body="The Resume Agent extracts your skills and experience in seconds." />
            <StepCard n="02" icon={Search} title="Get ranked matches" body="The Scout Agent surfaces roles from live listings, sorted by fit." />
            <StepCard n="03" icon={Wand2} title="Auto-tailor your pitch" body="The Tailor Agent rewrites your application for each specific role." />
            <StepCard n="04" icon={Send} title="Apply and track" body="The Application and Tracker Agents submit it and follow it through." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-2xl border border-line bg-surface p-10 text-center sm:p-14">
          <Radar className="mb-4 text-teal" size={28} />
          <h2 className="text-2xl font-semibold text-mist sm:text-3xl">Put your job search on autopilot</h2>
          <p className="mt-3 max-w-md text-sm text-slate">
            Free to try. No recruiter spam, no hidden fees — built as a working demonstration of
            agentic AI applied to a real problem.
          </p>
          <Link to="/signup" className="btn-ember mt-6">
            Create your account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-ember/10">
        <Icon size={19} className="text-ember" />
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold text-mist">{title}</h3>
      <p className="text-sm leading-relaxed text-slate">{body}</p>
    </div>
  );
}

function StepCard({ n, icon: Icon, title, body }) {
  return (
    <div className="card relative overflow-hidden p-6">
      <span className="absolute right-4 top-3 font-mono text-3xl font-semibold text-line">{n}</span>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10">
        <Icon size={19} className="text-teal" />
      </div>
      <h3 className="mb-2 font-display text-base font-semibold text-mist">{title}</h3>
      <p className="text-sm leading-relaxed text-slate">{body}</p>
    </div>
  );
}
