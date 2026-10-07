import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Mountain,
  Search,
  Settings,
  User,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/treks", label: "Treks" },
  { href: "/gear", label: "Gear" },
  { href: "/explore", label: "Explore" },
];

const Navbar = ({
  onMenuClick,
  user = { name: "Abhi", email: "abhi@tourtrek.com" },
  notificationCount = 3,
}) => {
  const pathname = window.location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the user menu on outside click or Escape
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initial = user.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <nav className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: menu button + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <a href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10242B] text-[#E9A23B] shadow-sm">
              <Mountain className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-bold tracking-tight text-[#10242B]">
              Tour<span className="text-[#2F6F8F]">Trek</span>
            </span>
          </a>
        </div>

        {/* Center: main navigation */}
        <div className="hidden h-full items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname?.startsWith(href);
            return (
              <a
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-full items-center px-4 text-sm font-medium transition-colors ${
                  active
                    ? "text-[#10242B]"
                    : "text-slate-500 hover:text-[#10242B]"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[#E9A23B]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right: search, notifications, user */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            aria-label="Search"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#10242B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F]"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            aria-label={`Notifications (${notificationCount} unread)`}
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#10242B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F]"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E9A23B] px-1 text-[10px] font-bold text-[#10242B] ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F8F]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F6F8F] text-xs font-semibold text-white">
                {initial}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {user.name}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-[#10242B]">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="p-1.5">
                  <a
                    href="/dashboard/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#10242B]"
                  >
                    <User className="h-4 w-4" /> Profile
                  </a>
                  <a
                    href="/dashboard/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#10242B]"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </a>
                  <button
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;