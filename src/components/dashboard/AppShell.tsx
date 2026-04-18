import { Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getDerivClient, type ConnectionStatus } from "@/lib/deriv";
import { Button } from "@/components/ui/button";
import { LogoBadge } from "@/components/ui/logo-badge";
import {
  Activity,
  LayoutDashboard,
  AppWindow,
  KeyRound,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";

const statusColor: Record<ConnectionStatus, string> = {
  idle: "bg-muted-foreground",
  connecting: "bg-warning animate-pulse",
  open: "bg-warning animate-pulse",
  authorized: "bg-success",
  closed: "bg-muted-foreground",
  error: "bg-destructive",
};

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/apps", label: "My Apps", icon: AppWindow, exact: false },
  { to: "/tokens", label: "API Tokens", icon: KeyRound, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function AppShell() {
  const { isAuthenticated, activeToken, session, logout, switchAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) void navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  // Keep a single live websocket authorized — every page reuses it.
  useEffect(() => {
    if (!activeToken) return;
    const client = getDerivClient();
    const off = client.onStatus((s) => setStatus(s));
    void client.authorize(activeToken).catch(() => {});
    return () => {
      off();
    };
  }, [activeToken]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-72 flex-col border-r border-border/60 bg-card/95 p-4 shadow-lg shadow-black/10 backdrop-blur-md md:flex">
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-left text-xs text-white shadow-sm backdrop-blur-sm opacity-60">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500">
            <LogoBadge className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-white">App Deriv Sites</span>
            <span className="text-[10px] leading-4 text-muted-foreground">
              <span className="italic">Powered by </span>
              <span className="font-semibold text-destructive">Deriv</span>
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/30 px-3 py-2 text-xs text-muted-foreground">
            <span>Status</span>
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor[status]}`} />
          </div>

          {session && session.accounts.length > 1 && (
            <select
              value={session.activeAccount}
              onChange={(e) => switchAccount(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
            >
              {session.accounts.map((a) => (
                <option key={a.account} value={a.account}>
                  {a.account} {a.currency ? `(${a.currency})` : ""}
                </option>
              ))}
            </select>
          )}

          <Button variant="secondary" size="sm" className="w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-card/95 p-4 shadow-xl shadow-black/20 backdrop-blur-md transition duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-left text-xs text-white shadow-sm backdrop-blur-sm opacity-60">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500">
            <LogoBadge className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-white">App Deriv Sites</span>
            <span className="text-[10px] leading-4 text-muted-foreground">
              <span className="italic">Powered by </span>
              <span className="font-semibold text-destructive">Deriv</span>
            </span>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={logout}>
            Logout
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/60 backdrop-blur-md md:ml-72">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="md:hidden"
            >
              <div className="flex h-5 w-5 flex-col justify-between">
                <span className="block h-[2px] w-4 rounded-full bg-foreground" />
                <span className="block h-[2px] w-4 rounded-full bg-foreground" />
                <span className="block h-[2px] w-4 rounded-full bg-foreground" />
              </div>
            </Button>
            <div className="md:hidden flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-left text-xs text-white shadow-sm backdrop-blur-sm opacity-60">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500">
                <LogoBadge className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-white">App Deriv Sites</span>
                <span className="text-[10px] leading-4 text-muted-foreground">
                  <span className="italic">Powered by </span>
                  <span className="font-semibold text-destructive">Deriv</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs sm:flex">
              <span className={`h-2 w-2 rounded-full ${statusColor[status]}`} />
              <span className="capitalize text-muted-foreground">{status}</span>
            </div>

            {session && session.accounts.length > 1 && (
              <select
                value={session.activeAccount}
                onChange={(e) => switchAccount(e.target.value)}
                className="hidden rounded-md border border-border bg-background px-2 py-1.5 text-xs sm:block"
              >
                {session.accounts.map((a) => (
                  <option key={a.account} value={a.account}>
                    {a.account} {a.currency ? `(${a.currency})` : ""}
                  </option>
                ))}
              </select>
            )}

            <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
              <LogOut className="mr-1.5 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="md:pl-72">
        <Outlet />
      </main>
    </div>
  );
}
