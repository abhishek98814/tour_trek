import {
  Backpack,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Map,
  Mountain,
  Settings,
  User,
  X,
} from "lucide-react";

const MAIN_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "My bookings", icon: CalendarDays },
  { href: "/dashboard/treks", label: "My treks", icon: Mountain },
  { href: "/dashboard/tours", label: "My tours", icon: Map },
  { href: "/dashboard/gear", label: "Gear orders", icon: Backpack },
];

const ACCOUNT_ITEMS = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

const NavItem = ({ href, label, icon: Icon, exact, badge, pathname, onNavigate }) => {
  const active = exact ? pathname === href : pathname?.startsWith(href);

  return (
    <a
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9A23B] ${
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#E9A23B]" />
      )}
      <Icon
        className={`h-[18px] w-[18px] shrink-0 ${
          active ? "text-[#E9A23B]" : "text-slate-500 group-hover:text-slate-300"
        }`}
      />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="rounded-full bg-[#E9A23B] px-2 py-0.5 text-[11px] font-semibold text-[#10242B]">
          {badge}
        </span>
      ) : null}
    </a>
  );
};

const Sidebar = ({
  open = false,
  onClose = () => {},
  bookingCount = 0,
  nextTrip = null, // { name: "Annapurna Base Camp", daysLeft: 12, progress: 70 }
  onLogout = () => {},
}) => {
  const pathname = window.location.pathname;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#10242B]/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-[#10242B] px-6 py-6 transition-transform duration-300 lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="text-base font-bold text-white">
            Tour<span className="text-[#E9A23B]">Trek</span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main menu */}
        <p className="mb-3 px-3.5 text-xs font-medium text-slate-500">Dashboard</p>
        <nav className="space-y-1">
          {MAIN_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              badge={item.href === "/dashboard/bookings" ? bookingCount : 0}
              pathname={pathname}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="my-6 h-px bg-white/10" />

        {/* Account */}
        <p className="mb-3 px-3.5 text-xs font-medium text-slate-500">Account</p>
        <nav className="space-y-1">
          {ACCOUNT_ITEMS.map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="mt-auto space-y-3 pt-8">
          {nextTrip && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2F6F8F] to-[#1B4A61] p-4">
              {/* Ridgeline */}
              <svg
                viewBox="0 0 200 60"
                className="pointer-events-none absolute -bottom-1 right-0 w-full opacity-20"
                fill="white"
                aria-hidden="true"
              >
                <path d="M0 60 L40 20 L62 38 L100 4 L140 42 L165 26 L200 60 Z" />
              </svg>
              <p className="text-xs text-sky-100/80">Next trek</p>
              <p className="mt-1 text-sm font-semibold leading-snug text-white">
                {nextTrip.name}
              </p>
              <p className="mt-0.5 text-xs text-sky-100/80">
                Starts in {nextTrip.daysLeft} days
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#E9A23B]"
                  style={{ width: `${nextTrip.progress ?? 0}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;