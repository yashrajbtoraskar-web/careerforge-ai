import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { ALL_JOBS, matchScore } from "../data/jobs";

const StoreContext = createContext(null);

const LS_USERS = "cf_users";
const LS_SESSION = "cf_session";
const LS_ALL_APPS = "cf_all_applications"; // single shared source of truth for every user's applications
const LS_RESUME_PREFIX = "cf_resume_";

const STAGES = ["Submitted", "Under Review", "Interview", "Offer"]; // linear progress path
const TERMINAL_STAGES = ["Rejected"]; // outside the linear path
const AUTO_REFRESH_MS = 2500;

function makeRoomId(appId) {
  return `cf-room-${appId}`.replace(/[^a-zA-Z0-9-]/g, "");
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  // Let other parts of the same tab know data changed immediately (native "storage"
  // events only fire in *other* tabs, not the one that made the change).
  window.dispatchEvent(new CustomEvent("cf-data-changed", { detail: { key } }));
}

function seedUsersIfEmpty() {
  const users = readJSON(LS_USERS, null);
  if (users) return users;
  const seeded = [
    {
      id: "admin-1",
      name: "Platform Admin",
      email: "admin@careerforge.ai",
      password: "admin123",
      role: "admin",
      createdAt: Date.now(),
    },
  ];
  writeJSON(LS_USERS, seeded);
  return seeded;
}

const AGENT_STEPS = [
  { key: "resume", label: "Resume Agent", verb: "Parsing resume and extracting verified skills" },
  { key: "scout", label: "Scout Agent", verb: "Scanning listing against live requirement set" },
  { key: "tailor", label: "Tailor Agent", verb: "Rewriting summary and bullet points for this role" },
  { key: "apply", label: "Application Agent", verb: "Compiling application package and submitting" },
  { key: "tracker", label: "Tracker Agent", verb: "Registering application in the tracking pipeline" },
];

export function StoreProvider({ children }) {
  const [users, setUsers] = useState(() => seedUsersIfEmpty());
  const [session, setSession] = useState(() => readJSON(LS_SESSION, null));
  const [resumeSkills, setResumeSkills] = useState([]);
  const [resumeName, setResumeName] = useState("");
  const [allApplications, setAllApplications] = useState(() => readJSON(LS_ALL_APPS, []));
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Load per-user resume whenever session changes
  useEffect(() => {
    if (!session) {
      setResumeSkills([]);
      setResumeName("");
      return;
    }
    const resumeData = readJSON(LS_RESUME_PREFIX + session.id, { skills: [], fileName: "" });
    setResumeSkills(resumeData.skills || []);
    setResumeName(resumeData.fileName || "");
  }, [session]);

  // Keep the shared applications list in sync automatically — polling covers same-tab
  // updates made elsewhere in the app, and the storage/cf-data-changed listeners give
  // near-instant updates when the admin (or the user, in another tab) changes something.
  useEffect(() => {
    const refresh = () => setAllApplications(readJSON(LS_ALL_APPS, []));
    refresh();
    const interval = setInterval(refresh, AUTO_REFRESH_MS);
    const onStorage = (e) => {
      if (!e.key || e.key === LS_ALL_APPS) refresh();
    };
    const onCustom = (e) => {
      if (!e.detail?.key || e.detail.key === LS_ALL_APPS) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("cf-data-changed", onCustom);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cf-data-changed", onCustom);
    };
  }, []);

  const persistUsers = (next) => {
    setUsers(next);
    writeJSON(LS_USERS, next);
  };

  const signup = useCallback(
    ({ name, email, password }) => {
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) return { ok: false, error: "An account with this email already exists." };
      const newUser = { id: `u-${Date.now()}`, name, email, password, role: "user", createdAt: Date.now() };
      const next = [...users, newUser];
      persistUsers(next);
      const s = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
      setSession(s);
      writeJSON(LS_SESSION, s);
      return { ok: true };
    },
    [users]
  );

  const login = useCallback(
    ({ email, password }) => {
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) return { ok: false, error: "Invalid email or password." };
      const s = { id: found.id, name: found.name, email: found.email, role: found.role };
      setSession(s);
      writeJSON(LS_SESSION, s);
      return { ok: true };
    },
    [users]
  );

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(LS_SESSION);
  }, []);

  const saveResume = useCallback(
    (fileName, skills) => {
      if (!session) return;
      setResumeSkills(skills);
      setResumeName(fileName);
      writeJSON(LS_RESUME_PREFIX + session.id, { fileName, skills });
    },
    [session]
  );

  // applications = only the logged-in user's own applications, derived from the shared list
  const applications = session ? allApplications.filter((a) => a.userId === session.id) : [];

  const hasApplied = useCallback(
    (jobId) => applications.some((a) => a.jobId === jobId),
    [applications]
  );

  const createApplication = useCallback(
    (job) => {
      if (!session) return null;
      const record = {
        id: `APP-${Date.now()}`,
        userId: session.id,
        userName: session.name,
        userEmail: session.email,
        jobId: job.id,
        title: job.title,
        company: job.company,
        city: job.city,
        matchScore: matchScore(resumeSkills, job.skills),
        stage: "Submitted",
        history: [{ stage: "Submitted", at: Date.now() }],
        createdAt: Date.now(),
      };
      const current = readJSON(LS_ALL_APPS, []);
      const next = [record, ...current];
      writeJSON(LS_ALL_APPS, next);
      setAllApplications(next);
      return record;
    },
    [resumeSkills, session]
  );

  // Admin-only: set any application to any stage (used by the admin console).
  // Automatically creates an interview room the first time a candidate is moved to "Interview".
  const setApplicationStage = useCallback((appId, stage) => {
    const current = readJSON(LS_ALL_APPS, []);
    const next = current.map((a) => {
      if (a.id !== appId || a.stage === stage) return a;
      const patch = { ...a, stage, history: [...a.history, { stage, at: Date.now() }] };
      if (stage === "Interview" && !patch.interviewRoomId) {
        patch.interviewRoomId = makeRoomId(a.id);
      }
      return patch;
    });
    writeJSON(LS_ALL_APPS, next);
    setAllApplications(next);
  }, []);

  // Admin-only: move an application one stage forward.
  const advanceApplication = useCallback((appId) => {
    const current = readJSON(LS_ALL_APPS, []);
    const target = current.find((a) => a.id === appId);
    if (!target) return;
    const idx = STAGES.indexOf(target.stage);
    if (idx === -1 || idx >= STAGES.length - 1) return;
    const next = current.map((a) =>
      a.id === appId
        ? { ...a, stage: STAGES[idx + 1], history: [...a.history, { stage: STAGES[idx + 1], at: Date.now() }] }
        : a
    );
    writeJSON(LS_ALL_APPS, next);
    setAllApplications(next);
  }, []);

  const isAdmin = session?.role === "admin";

  const adminStats = {
    totalUsers: users.filter((u) => u.role !== "admin").length,
    totalJobs: ALL_JOBS.length,
    totalApplications: allApplications.length,
  };

  const value = {
    session,
    isAdmin,
    login,
    signup,
    logout,
    resumeSkills,
    resumeName,
    saveResume,
    applications,
    allApplications, // full shared list — used by the admin console to see every candidate
    createApplication,
    advanceApplication,
    setApplicationStage,
    hasApplied,
    adminStats,
    AGENT_STEPS,
    STAGES,
    TERMINAL_STAGES,
    getApplicationById: (id) => allApplications.find((a) => a.id === id) || null,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
