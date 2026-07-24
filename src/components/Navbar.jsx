import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Bell, CheckCircle2, XCircle } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "../context/StoreContext";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-teal" : "text-slate hover:text-mist"}`;

export default function Navbar() {
  const { session, logout, isAdmin, notifications, unreadNotifCount, markNotificationsRead } = useStore();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const toggleNotif = () => {
    setNotifOpen((o) => {
      const next = !o;
      if (next && unreadNotifCount > 0) markNotificationsRead();
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const links = session
    ? isAdmin
      ? [
          { to: "/admin", label: "Admin Console" },
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/jobs", label: "Jobs" },
          { to: "/resume", label: "Resume" },
          { to: "/applications", label: "Applications" },
        ]
    : [
        { to: "/jobs", label: "Browse Jobs" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              {!isAdmin && (
                <div className="relative">
                  <button
                    onClick={toggleNotif}
                    aria-label="Notifications"
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate hover:bg-surface2 hover:text-mist"
                  >
                    <Bell size={17} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-ember" />
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-line bg-surface p-2 shadow-xl">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate">No notifications yet.</p>
                      ) : (
                        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                          {notifications.map((n) => (
                            <div key={n.id} className="flex items-start gap-2 rounded-md p-2.5 hover:bg-surface2">
                              {n.type === "shortlisted" ? (
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal" />
                              ) : (
                                <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                              )}
                              <div>
                                <p className="text-xs text-mist">{n.message}</p>
                                <p className="mt-0.5 text-[10px] text-slate">
                                  {new Date(n.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <span className="text-sm text-slate">Hi, {session.name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="btn-ghost !px-3.5 !py-2 text-sm">
                <LogOut size={15} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn-ember !px-4 !py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="text-mist md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-5 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            {session ? (
              <button onClick={handleLogout} className="btn-ghost mt-2 justify-start !py-2 text-sm">
                <LogOut size={15} /> Log out
              </button>
            ) : (
              <div className="mt-2 flex gap-3">
                <Link to="/login" className="btn-ghost flex-1 !py-2 text-sm" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className="btn-ember flex-1 !py-2 text-sm" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
