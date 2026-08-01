import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { ALL_JOBS, matchScore } from "../data/jobs";

const StoreContext = createContext(null);

const STAGES = ["Submitted", "Under Review", "Interview", "Offer"]; // linear progress path
const TERMINAL_STAGES = ["Rejected"]; // outside the linear path

function makeRoomId(appId) {
  return `cf-room-${appId}`.replace(/[^a-zA-Z0-9-]/g, "");
}

const AGENT_STEPS = [
  { key: "resume", label: "Resume Agent", verb: "Parsing resume and extracting verified skills" },
  { key: "scout", label: "Scout Agent", verb: "Scanning listing against live requirement set" },
  { key: "tailor", label: "Tailor Agent", verb: "Rewriting summary and bullet points for this role" },
  { key: "apply", label: "Application Agent", verb: "Compiling application package and submitting" },
  { key: "tracker", label: "Tracker Agent", verb: "Registering application in the tracking pipeline" },
];

function mapAppRow(r) {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    jobId: r.job_id,
    title: r.title,
    company: r.company,
    city: r.city,
    matchScore: r.match_score,
    stage: r.stage,
    history: r.history || [],
    interviewRoomId: r.interview_room_id,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export function StoreProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [resumeName, setResumeName] = useState("");
  const [allApplications, setAllApplications] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setSession(null);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
    setSession({
      id: authUser.id,
      name: profile?.name || authUser.email,
      email: authUser.email,
      role: profile?.role || "user",
    });
  }, []);

  // Bootstrap auth session on load, then keep it in sync
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session?.user ?? null).finally(() => setAuthLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      loadProfile(sess?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  // Load this user's resume whenever they log in
  useEffect(() => {
    if (!isSupabaseConfigured || !session) {
      setResumeSkills([]);
      setResumeName("");
      return;
    }
    supabase
      .from("resumes")
      .select("*")
      .eq("user_id", session.id)
      .maybeSingle()
      .then(({ data }) => {
        setResumeSkills(data?.skills || []);
        setResumeName(data?.file_name || "");
      });
  }, [session?.id]);

  // Applications: fetch once, then stay in sync automatically via Supabase Realtime —
  // this is what makes an admin's status change appear for the candidate instantly,
  // on any device, without polling.
  useEffect(() => {
    if (!isSupabaseConfigured || !session) {
      setAllApplications([]);
      return;
    }
    async function load() {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        return;
      }
      setAllApplications((data || []).map(mapAppRow));
    }
    load();

    const channel = supabase
      .channel("applications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session?.id]);

  // Admin-only: full list of registered candidates
  useEffect(() => {
    if (!isSupabaseConfigured || !session || session.role !== "admin") {
      setRegisteredUsers([]);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .neq("role", "admin")
      .then(({ data }) => {
        setRegisteredUsers(
          (data || []).map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            createdAt: new Date(u.created_at).getTime(),
          }))
        );
      });
  }, [session?.id, session?.role]);

  const signup = useCallback(
    async ({ name, email, password }) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) return { ok: false, error: error.message };
      if (data.user) {
        await supabase.from("profiles").insert({ id: data.user.id, name, email, role: "user" });
      }
      if (!data.session) {
        return { ok: false, error: "Account created. Check your email to confirm it, then log in." };
      }
      await loadProfile(data.user);
      return { ok: true };
    },
    [loadProfile]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      await loadProfile(data.user);
      return { ok: true };
    },
    [loadProfile]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const saveResume = useCallback(
    async (fileName, skills) => {
      if (!session) return;
      setResumeSkills(skills);
      setResumeName(fileName);
      await supabase
        .from("resumes")
        .upsert({ user_id: session.id, file_name: fileName, skills }, { onConflict: "user_id" });
    },
    [session]
  );

  const applications = session ? allApplications.filter((a) => a.userId === session.id) : [];

  const hasApplied = useCallback((jobId) => applications.some((a) => a.jobId === jobId), [applications]);

  const createApplication = useCallback(
    async (job) => {
      if (!session) return null;
      const record = {
        user_id: session.id,
        user_name: session.name,
        user_email: session.email,
        job_id: job.id,
        title: job.title,
        company: job.company,
        city: job.city,
        match_score: matchScore(resumeSkills, job.skills),
        stage: "Submitted",
        history: [{ stage: "Submitted", at: Date.now() }],
      };
      const { data, error } = await supabase.from("applications").insert(record).select().single();
      if (error) {
        console.error(error);
        return null;
      }
      return mapAppRow(data);
    },
    [resumeSkills, session]
  );

  // Admin-only: set any application to any stage. Auto-creates an interview room
  // the first time a candidate is moved to "Interview".
  const setApplicationStage = useCallback(
    async (appId, stage) => {
      const current = allApplications.find((a) => a.id === appId);
      if (!current || current.stage === stage) return;
      const patch = { stage, history: [...current.history, { stage, at: Date.now() }] };
      if (stage === "Interview" && !current.interviewRoomId) {
        patch.interview_room_id = makeRoomId(appId);
      }
      const { error } = await supabase.from("applications").update(patch).eq("id", appId);
      if (error) console.error(error);
    },
    [allApplications]
  );

  const advanceApplication = useCallback(
    async (appId) => {
      const current = allApplications.find((a) => a.id === appId);
      if (!current) return;
      const idx = STAGES.indexOf(current.stage);
      if (idx === -1 || idx >= STAGES.length - 1) return;
      await setApplicationStage(appId, STAGES[idx + 1]);
    },
    [allApplications, setApplicationStage]
  );

  const isAdmin = session?.role === "admin";

  const adminStats = {
    totalUsers: registeredUsers.length,
    totalJobs: ALL_JOBS.length,
    totalApplications: allApplications.length,
  };

  if (!isSupabaseConfigured) {
    return (
      <div style={{ padding: 48, textAlign: "center", fontFamily: "sans-serif", color: "#1C1B1F" }}>
        <h2 style={{ marginBottom: 8 }}>Database not configured</h2>
        <p style={{ color: "#6B6A72", maxWidth: 420, margin: "0 auto" }}>
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file locally, and to your
          Vercel project's Environment Variables, then redeploy.
        </p>
      </div>
    );
  }

  if (authLoading) {
    return <div style={{ padding: 48, textAlign: "center", fontFamily: "sans-serif", color: "#6B6A72" }}>Loading...</div>;
  }

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
    allApplications,
    createApplication,
    advanceApplication,
    setApplicationStage,
    hasApplied,
    adminStats,
    registeredUsers,
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
