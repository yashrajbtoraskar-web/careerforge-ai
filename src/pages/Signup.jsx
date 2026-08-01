import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useStore } from "../context/StoreContext";

export default function Signup() {
  const { signup } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signup(form);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/resume");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-7">
          <h1 className="mb-1 font-display text-xl font-semibold text-mist">Create your account</h1>
          <p className="mb-6 text-sm text-slate">Takes under a minute. No credit card.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate">Full name</label>
              <input
                required
                className="input-field"
                placeholder="Yash Toraskar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate">Email</label>
              <input
                required
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate">Password</label>
              <input
                required
                minLength={4}
                type="password"
                className="input-field"
                placeholder="At least 4 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-ember">{error}</p>}
            <button type="submit" disabled={loading} className="btn-ember mt-2 disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-slate">
          Already have an account?{" "}
          <Link to="/login" className="text-teal hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
