import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, X, Sparkles, Check } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { ALL_SKILLS } from "../data/jobs";

export default function ResumeUpload() {
  const { saveResume, resumeSkills, resumeName } = useStore();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [fileName, setFileName] = useState(resumeName || "");
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState(resumeSkills || []);
  const [done, setDone] = useState(resumeSkills?.length > 0);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(file);
    } else {
      // For pdf/docx we can't parse client-side without extra libs;
      // record the filename and let the user paste text instead.
      setText((t) => t || "");
    }
  };

  const runResumeAgent = () => {
    setScanning(true);
    setDone(false);
    setTimeout(() => {
      const lower = text.toLowerCase();
      const found = ALL_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
      const finalSkills = found.length ? found : ALL_SKILLS.slice(0, 5);
      setExtracted(finalSkills);
      setScanning(false);
      setDone(true);
    }, 1400);
  };

  const toggleSkill = (skill) => {
    setExtracted((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleSave = () => {
    saveResume(fileName || "resume.txt", extracted);
    navigate("/jobs");
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <span className="eyebrow">Step 1 of 4 · Resume Agent</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-mist">Feed the pipeline your resume</h1>
      <p className="mt-2 text-sm text-slate">
        Upload a .txt copy or paste your resume text below. The Resume Agent scans it and extracts the
        skills every other agent will use to find and tailor matches.
      </p>

      <div className="mt-8 card p-6">
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-10 text-center transition-colors hover:border-teal"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <UploadCloud size={28} className="mb-3 text-teal" />
          <p className="text-sm text-mist">
            {fileName ? (
              <span className="flex items-center gap-2 font-medium">
                <FileText size={15} /> {fileName}
              </span>
            ) : (
              "Drag a .txt resume here, or click to browse"
            )}
          </p>
          <p className="mt-1 text-xs text-slate">PDF/DOCX also accepted — paste the text below for best extraction</p>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <textarea
          className="input-field mt-4 min-h-[140px] font-mono text-xs"
          placeholder="Paste your resume text here (skills, experience, projects)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={runResumeAgent}
          disabled={!text.trim() || scanning}
          className="btn-ember mt-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={16} className={scanning ? "animate-spin" : ""} />
          {scanning ? "Scanning resume…" : "Run Resume Agent"}
        </button>

        {done && (
          <div className="mt-6 border-t border-line pt-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-teal">
              <Check size={16} /> Extracted {extracted.length} skills — tap to adjust
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_SKILLS.map((skill) => {
                const active = extracted.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? "border-ember bg-ember/10 text-ember"
                        : "border-line bg-surface2 text-slate hover:border-slate"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            <button onClick={handleSave} className="btn-ember mt-6 w-full sm:w-auto">
              Save profile & find matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
