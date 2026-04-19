import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useDerivData } from "@/lib/useDerivData";
import { useCommissionStats } from "@/lib/useCommissionStats";
import { StatCard } from "@/components/dashboard/StatCard";
import { ComparisonCard } from "@/components/dashboard/ComparisonCard";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { AppCommissionsTable } from "@/components/dashboard/AppCommissionsTable";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/")({
  component: Home,
});

function Home() {
  const { activeToken, session } = useAuth();
  if (!activeToken) return null;
  return <Dashboard token={activeToken} accountLabel={session?.activeAccount ?? ""} />;
}

function Dashboard({ token, accountLabel }: { token: string; accountLabel: string }) {
  const { status, data, loading, error, refresh } = useDerivData(token);

  // Custom date range — default to last 30 days.
  const [rangeFrom, setRangeFrom] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [rangeTo, setRangeTo] = useState<Date>(() => new Date());

  // App filter state - null means all apps
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  const customRange = useMemo(() => ({ from: rangeFrom, to: rangeTo }), [rangeFrom, rangeTo]);
  const {
    data: comm,
    loading: commLoading,
    error: commError,
    refresh: refreshComm,
    totals,
  } = useCommissionStats(token, customRange);

  const profitTableCurrency = data?.balance?.currency ?? data?.authorize?.currency ?? "USD";

  const selectedAppStats = useMemo(() => {
    if (!comm || selectedAppId == null) return null;
    const defaultRow = {
      app_id: selectedAppId,
      app_markup_usd: 0,
      app_markup_value: 0,
      dev_currcode: "USD",
      transactions_count: 0,
    };
    const find = (period: typeof comm.today) =>
      period.breakdown.find((row) => row.app_id === selectedAppId) ?? defaultRow;
    return {
      today: find(comm.today),
      yesterday: find(comm.yesterday),
      thisMonth: find(comm.thisMonth),
      lastMonth: find(comm.lastMonth),
      range: find(comm.range),
    };
  }, [comm, selectedAppId]);

  const handleRefresh = () => {
    refresh();
    refreshComm();
  };

  return (
    <main className="min-h-screen bg-background w-full">
      <div className="px-[30px] py-8 md:max-w-none md:px-[30px] md:py-0 w-full">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 px-4 sm:px-6 md:px-0">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {data?.authorize?.fullname || "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Account{" "}
              <span className="font-mono text-foreground">
                {data?.authorize?.loginid ?? accountLabel}
              </span>
              {data?.authorize?.country ? ` · ${data.authorize.country.toUpperCase()}` : ""}
              {comm?.apps?.length ? ` · ${comm.apps.length} owned apps` : ""}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading || commLoading}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${loading || commLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {(error || commError) && (
          <Card className="mb-6 flex items-start gap-3 border-destructive/40 bg-destructive/10 p-4 mx-4 sm:mx-6 md:mx-0">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div className="text-sm">
              <div className="font-medium text-destructive">Failed to load data</div>
              <div className="mt-0.5 text-destructive/80">{error || commError}</div>
            </div>
          </Card>
        )}

        {/* ===== Commission comparisons ===== */}
        <section className="mb-2 flex flex-wrap items-end justify-between gap-3 px-4 sm:px-6 md:px-0">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">
              Commission overview
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedAppId ? selectedAppId.toString() : "all"}
              onValueChange={(value) =>
                setSelectedAppId(value === "all" ? null : parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={comm?.apps?.length ? "All apps" : "Select app"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All apps</SelectItem>
                {comm?.apps?.map((app) => (
                  <SelectItem key={app.app_id} value={app.app_id.toString()}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {commLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Updating…
              </span>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 grid-portrait-4 px-4 sm:px-6 md:px-0">
          <ComparisonCard
            label="Today"
            current={
              selectedAppStats?.today?.app_markup_usd ?? comm?.today.total_app_markup_usd ?? 0
            }
            previous={
              selectedAppStats?.yesterday?.app_markup_usd ??
              comm?.yesterday.total_app_markup_usd ??
              0
            }
            previousLabel="yesterday"
            className="card-portrait"
          />
          <ComparisonCard
            label="Yesterday"
            current={
              selectedAppStats?.yesterday?.app_markup_usd ??
              comm?.yesterday.total_app_markup_usd ??
              0
            }
            previous={
              selectedAppStats?.today?.app_markup_usd ?? comm?.today.total_app_markup_usd ?? 0
            }
            previousLabel="today"
            className="card-portrait"
          />
          <ComparisonCard
            label="This month"
            current={
              selectedAppStats?.thisMonth?.app_markup_usd ??
              comm?.thisMonth.total_app_markup_usd ??
              0
            }
            previous={
              selectedAppStats?.lastMonth?.app_markup_usd ??
              comm?.lastMonth.total_app_markup_usd ??
              0
            }
            previousLabel="last month"
            className="card-portrait"
          />
          <ComparisonCard
            label="Last month"
            current={
              selectedAppStats?.lastMonth?.app_markup_usd ??
              comm?.lastMonth.total_app_markup_usd ??
              0
            }
            previous={
              selectedAppStats?.thisMonth?.app_markup_usd ??
              comm?.thisMonth.total_app_markup_usd ??
              0
            }
            previousLabel="this month"
            className="card-portrait"
          />
        </section>

        {/* ===== Totals ===== */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 grid-portrait-4 px-4 sm:px-6 md:px-0">
          <StatCard
            label="Total commission (this month)"
            accent="success"
            value={`$${(selectedAppStats?.thisMonth?.app_markup_usd ?? comm?.thisMonth.total_app_markup_usd ?? 0).toFixed(2)}`}
            hint={`Last month: $${(selectedAppStats?.lastMonth?.app_markup_usd ?? comm?.lastMonth.total_app_markup_usd ?? 0).toFixed(2)}`}
            className="card-portrait"
          />
          <StatCard
            label="Total transactions (this month)"
            value={(
              selectedAppStats?.thisMonth?.transactions_count ??
              comm?.thisMonth.total_transactions_count ??
              0
            ).toLocaleString()}
            hint={`Last month: ${(selectedAppStats?.lastMonth?.transactions_count ?? comm?.lastMonth.total_transactions_count ?? 0).toLocaleString()}`}
            className="card-portrait"
          />
          <StatCard
            label="Owned apps"
            accent="accent"
            value={(totals?.totalApps ?? 0).toString()}
            hint={`${totals?.activeApps ?? 0} with commission activity`}
            className="card-portrait"
          />
          <StatCard
            label="Today's transactions"
            value={(
              selectedAppStats?.today?.transactions_count ??
              comm?.today.total_transactions_count ??
              0
            ).toLocaleString()}
            hint={`Yesterday: ${(selectedAppStats?.yesterday?.transactions_count ?? comm?.yesterday.total_transactions_count ?? 0).toLocaleString()}`}
            className="card-portrait"
          />
        </section>

        {/* ===== Custom range ===== */}
        <section className="mt-6 px-4 sm:px-6 md:px-0">
          <Card className="border-border/60 bg-[image:var(--gradient-card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Custom date range</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pick any window to query <span className="font-mono">app_markup_statistics</span>{" "}
                  directly.
                </p>
              </div>
              <DateRangePicker
                from={rangeFrom}
                to={rangeTo}
                onChange={(f, t) => {
                  setRangeFrom(f);
                  setRangeTo(t);
                }}
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3 grid-portrait-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Commission
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {"$" +
                    (
                      selectedAppStats?.range?.app_markup_usd ??
                      comm?.range.total_app_markup_usd ??
                      0
                    ).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Transactions
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {(
                    selectedAppStats?.range?.transactions_count ??
                    comm?.range.total_transactions_count ??
                    0
                  ).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Active apps in range
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {selectedAppId ? 1 : (comm?.range.breakdown.length ?? 0)}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ===== App breakdown ===== */}
        <section className="mt-6 px-4 sm:px-6 md:px-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight">Commission by app</h2>
          </div>
          <AppCommissionsTable
            apps={comm?.apps ?? []}
            breakdown={comm?.range.breakdown ?? []}
            rangeLabel={`${format(rangeFrom, "MMM d, yyyy")} – ${format(rangeTo, "MMM d, yyyy")}`}
            selectedAppId={selectedAppId}
          />
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground px-4 sm:px-6 md:px-0">
          Live data via <span className="font-mono">wss://ws.derivws.com/websockets/v3</span>
        </footer>
      </div>
    </main>
  );
}
