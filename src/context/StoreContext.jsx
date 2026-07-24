import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ALL_JOBS, matchScore } from "../data/jobs";

const StoreContext = createContext(null);

const LS_USERS = "cf_users";
const LS_SESSION = "cf_session";
const LS_APPS_PREFIX = "cf_apps_";
const LS_RESUME_PREFIX = "cf_resume_";
const LS_ALL_APPS = "cf_all_applications";
const LS_NOTIF_PREFIX = "cf_notif_";

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
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allApplications, setAllApplications] = useState(() => readJSON(LS_ALL_APPS, []));

  // Load per-user data whenever session changes
  useEffect(() => {
    if (!session) {
      setResumeSkills([]);
      setResumeName("");
      setApplications([]);
      setNotifications([]);
      return;
    }
    const resumeData = readJSON(LS_RESUME_PREFIX + session.id, { skills: [], fileName: "" });
    setResumeSkills(resumeData.skills || []);
    setResumeName(resumeData.fileName || "");
    setApplications(readJSON(LS_APPS_PREFIX + session.id, []));
    setNotifications(readJSON(LS_NOTIF_PREFIX + session.id, []));
  }, [session]);

  // Refresh the global applicant list (used by Admin) whenever we come back to the tab/window
  useEffect(() => {
    const refresh = () => setAllApplications(readJSON(LS_ALL_APPS, []));
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
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

  const persistApplications = (next) => {
    setApplications(next);
    if (session) writeJSON(LS_APPS_PREFIX + session.id, next);
  };

  const hasApplied = useCallback(
    (jobId) => applications.some((a) => a.jobId === jobId),
    [applications]
  );

  const persistAllApplications = (next) => {
    setAllApplications(next);
    writeJSON(LS_ALL_APPS, next);
  };

  const pushNotification = (userId, notif) => {
    const key = LS_NOTIF_PREFIX + userId;
    const existing = readJSON(key, []);
    const next = [{ id: `N-${Date.now()}`, read: false, createdAt: Date.now(), ...notif }, ...existing];
    writeJSON(key, next);
    if (session && session.id === userId) setNotifications(next);
  };

  const createApplication = useCallback(
    (job) => {
      const record = {
        id: `APP-${Date.now()}`,
        jobId: job.id,
        title: job.title,
        company: job.company,
        city: job.city,
        matchScore: matchScore(resumeSkills, job.skills),
        stage: "Submitted",
        status: "Applied", // Applied | Shortlisted | Rejected
        applicantId: session?.id,
        applicantName: session?.name,
        applicantEmail: session?.email,
        history: [{ stage: "Submitted", at: Date.now() }],
        createdAt: Date.now(),
      };
      const next = [record, ...applications];
      persistApplications(next);
      persistAllApplications([record, ...allApplications]);
      return record;
    },
    [applications, allApplications, resumeSkills, session]
  );

  // Admin action: mark a candidate as Shortlisted or Rejected, and notify them
  const updateApplicationStatus = useCallback(
    (appId, status) => {
      const target = allApplications.find((a) => a.id === appId);
      if (!target) return;

      const nextAll = allApplications.map((a) =>
        a.id === appId
          ? { ...a, status, history: [...a.history, { stage: status, at: Date.now() }] }
          : a
      );
      persistAllApplications(nextAll);

      // Sync the applicant's own copy of this application (for their /applications view)
      if (target.applicantId) {
        const theirKey = LS_APPS_PREFIX + target.applicantId;
        const theirApps = readJSON(theirKey, []);
        const updatedTheirApps = theirApps.map((a) =>
          a.id === appId
            ? { ...a, status, history: [...a.history, { stage: status, at: Date.now() }] }
            : a
        );
        writeJSON(theirKey, updatedTheirApps);
        if (session?.id === target.applicantId) setApplications(updatedTheirApps);

        pushNotification(target.applicantId, {
          type: status === "Shortlisted" ? "shortlisted" : "rejected",
          message:
            status === "Shortlisted"
              ? `Good news! You've been shortlisted for ${target.title} at ${target.company}.`
              : `Update: You were not selected for ${target.title} at ${target.company}.`,
          jobTitle: target.title,
          company: target.company,
        });
      }
    },
    [allApplications, session]
  );

  const markNotificationsRead = useCallback(() => {
    if (!session) return;
    const next = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(next);
    writeJSON(LS_NOTIF_PREFIX + session.id, next);
  }, [notifications, session]);

  const advanceApplication = useCallback(
    (appId) => {
      const stages = ["Submitted", "Under Review", "Interview", "Offer"];
      const next = applications.map((a) => {
        if (a.id !== appId) return a;
        const idx = stages.indexOf(a.stage);
        if (idx === -1 || idx >= stages.length - 1) return a;
        const nextStage = stages[idx + 1];
        return { ...a, stage: nextStage, history: [...a.history, { stage: nextStage, at: Date.now() }] };
      });
      persistApplications(next);
    },
    [applications]
  );

  const isAdmin = session?.role === "admin";

  const adminStats = {
    totalUsers: users.filter((u) => u.role !== "admin").length,
    totalJobs: ALL_JOBS.length,
    totalApplications: Object.keys(localStorage)
      .filter((k) => k.startsWith(LS_APPS_PREFIX))
      .reduce((sum, k) => sum + readJSON(k, []).length, 0),
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
    createApplication,
    advanceApplication,
    hasApplied,
    adminStats,
    AGENT_STEPS,
    allApplications,
    updateApplicationStatus,
    notifications,
    unreadNotifCount: notifications.filter((n) => !n.read).length,
    markNotificationsRead,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
