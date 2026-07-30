import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Loader2 } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Interview() {
  const { appId } = useParams();
  const { session, isAdmin, getApplicationById } = useStore();
  const application = getApplicationById(appId);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("connecting"); // connecting | waiting | connected | error
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ended, setEnded] = useState(false);

  // Only the admin or the candidate who owns this application may join the room.
  const authorized =
    application && (isAdmin || application.userId === session?.id) && application.interviewRoomId;

  useEffect(() => {
    if (!authorized || ended) return;
    let cancelled = false;

    async function start() {
      try {
        const { default: Peer } = await import("peerjs");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) return;
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const myRole = isAdmin ? "admin" : "candidate";
        const otherRole = isAdmin ? "candidate" : "admin";
        const myId = `${application.interviewRoomId}-${myRole}`;
        const otherId = `${application.interviewRoomId}-${otherRole}`;

        const peer = new Peer(myId);
        peerRef.current = peer;

        peer.on("open", () => {
          setStatus("waiting");
          // Try to call the other side; if they haven't joined yet this will simply fail
          // silently and we rely on them calling us instead once they're ready.
          const call = peer.call(otherId, stream);
          if (call) {
            call.on("stream", (remoteStream) => {
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
              setStatus("connected");
            });
          }
        });

        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            setStatus("connected");
          });
        });

        peer.on("error", (err) => {
          // "peer-unavailable" just means the other participant hasn't joined yet — keep waiting.
          if (err.type !== "peer-unavailable") {
            console.error(err);
            setStatus("error");
          }
        });
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    start();
    return () => {
      cancelled = true;
      peerRef.current?.destroy();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [authorized, application?.interviewRoomId, isAdmin, ended]);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn((v) => !v);
  };
  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn((v) => !v);
  };
  const endCall = () => {
    peerRef.current?.destroy();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setEnded(true);
  };

  if (!application) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-slate">Application not found.</p>
        <Link to="/dashboard" className="btn-ember mt-4">Back to dashboard</Link>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-slate">You don't have access to this interview room.</p>
        <Link to="/dashboard" className="btn-ember mt-4">Back to dashboard</Link>
      </div>
    );
  }

  if (ended) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-mist">Interview ended</h1>
        <p className="mt-2 text-slate">You can close this tab now.</p>
        <Link to={isAdmin ? "/admin" : "/applications"} className="btn-ember mt-6">
          {isAdmin ? "Back to admin console" : "Back to my applications"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <span className="eyebrow">Live interview</span>
      <h1 className="mt-2 font-display text-2xl font-semibold text-mist">
        {application.title} · {application.company}
      </h1>
      <p className="mt-1 text-sm text-slate">
        {isAdmin ? `Interviewing ${application.userName}` : "One-to-one interview with the hiring team"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card relative aspect-video overflow-hidden !p-0">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full bg-surface2 object-cover" />
          {status !== "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface2/95">
              <Loader2 size={22} className="animate-spin text-slate" />
              <p className="text-sm text-slate">
                {status === "error" ? "Couldn't connect. Try refreshing." : "Waiting for the other participant to join..."}
              </p>
            </div>
          )}
          <span className="absolute bottom-2 left-2 rounded bg-ink/80 px-2 py-0.5 text-xs text-mist">
            {isAdmin ? application.userName : "Interviewer"}
          </span>
        </div>
        <div className="card relative aspect-video overflow-hidden !p-0">
          <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full bg-surface2 object-cover" />
          <span className="absolute bottom-2 left-2 rounded bg-ink/80 px-2 py-0.5 text-xs text-mist">You</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={toggleMic}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-line ${micOn ? "bg-surface text-mist" : "bg-red-500/10 text-red-600"}`}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button
          onClick={toggleCam}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-line ${camOn ? "bg-surface text-mist" : "bg-red-500/10 text-red-600"}`}
        >
          {camOn ? <VideoIcon size={18} /> : <VideoOff size={18} />}
        </button>
        <button
          onClick={endCall}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
