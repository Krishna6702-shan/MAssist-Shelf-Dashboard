import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/icons";
import { Button, Card } from "../components/ui";
import MiniTrendChart from "../components/charts/MiniTrendChart";
import Kpi from "../components/dashboard/Kpi";
import StoreTable from "../components/dashboard/StoreTable";
import { fetchDashboard } from "../services/apiService";

const formatPercent = (value) => (typeof value === "number" ? `${value.toFixed(1)}%` : "--");
const formatDelta = (delta) => {
  if (typeof delta !== "number") return "--";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
};

const DashboardPage = ({ selectedOrgId }) => {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState({ osa: [], sos: [], pgc: [] });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const deriveOrgId = () => {
      if (selectedOrgId) return selectedOrgId;
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const parsed = JSON.parse(userData);
          return parsed.org_id || parsed.orgId;
        }
      } catch {
        /* ignore */
      }
      return null;
    };

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const orgId = deriveOrgId();
        const params = { granularity: "month" };
        if (orgId) params.org_id = orgId;

        const response = await fetchDashboard(params, controller.signal);
        const results = Array.isArray(response?.results) ? response.results : null;
        const active =
          (orgId && results?.find((item) => item?.filters?.org_id === orgId)) ||
          results?.[0] ||
          response ||
          {};

        setKpis(active?.kpis ?? null);
        setTrends(active?.trends ?? { osa: [], sos: [], pgc: [] });
        setStores(active?.stores ?? []);
        if (!active?.kpis && !active?.stores) {
          setError("No dashboard data found");
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err?.message || "Failed to load dashboard");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => controller.abort();
  }, [selectedOrgId]);

  const trendConfig = useMemo(
    () => [
      { title: "OSA MoM", key: "osa", color: "var(--color-brand-300)" },
      { title: "SoS MoM", key: "sos", color: "var(--color-brand-200)" },
      { title: "PGC MoM", key: "pgc", color: "var(--color-brand-400)" },
    ],
    []
  );

  const storeRows = useMemo(
    () =>
      (stores || []).map((store) => ({
        store: store.shop_name || store.shop_id || "Unknown Store",
        city: store.city ?? "--",
        osa: store.osa_percent,
        sos: store.sos_percent,
        pgc: store.pgc_percent,
        images: store.images_uploaded ?? 0,
      })),
    [stores]
  );

  return (
    <div className="space-y-6">
      <Card
        title="Shelf Performance Overview"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="gap-1">
              <span className="text-sm">Dec 20 - Dec 31</span>
              <Icon.calendar className="h-4 w-4" />
            </Button>
            <Button variant="secondary" className="gap-1">
              This Week <Icon.chevronDown className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        {error && <div className="mb-3 text-sm text-red-600">Error: {error}</div>}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Kpi
            title="OSA %"
            value={formatPercent(kpis?.osa_percent?.value)}
            delta={formatDelta(kpis?.osa_percent?.delta_vs_compare)}
            negative={(kpis?.osa_percent?.delta_vs_compare ?? 0) < 0}
          />
          <Kpi
            title="SoS %"
            value={formatPercent(kpis?.sos_percent?.value)}
            delta={formatDelta(kpis?.sos_percent?.delta_vs_compare)}
            negative={(kpis?.sos_percent?.delta_vs_compare ?? 0) < 0}
          />
          <Kpi
            title="Planogram Compliance (PGC) %"
            value={formatPercent(kpis?.pgc_percent?.value)}
            delta={formatDelta(kpis?.pgc_percent?.delta_vs_compare)}
            negative={(kpis?.pgc_percent?.delta_vs_compare ?? 0) < 0}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {trendConfig.map(({ title, key, color }) => (
            <div key={title} data-reveal className="glass rounded-2xl border border-white/12 bg-white/8 p-5 opacity-0">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-black">{title}</div>
              <MiniTrendChart
                label={`${title} trend`}
                color={color}
                data={(trends?.[key] ?? []).map((d) => ({ label: d.label, value: d.value }))}
              />
            </div>
          ))}
        </div>
        {loading && <div className="mt-4 text-sm text-black">Loading dashboard...</div>}
      </Card>

      <Card
        title="Store-wise Shelf Performance"
        subtitle="View detailed OSA, SoS, and Planogram Compliance across all stores."
      >
        <StoreTable rows={storeRows} loading={loading} error={error} />
      </Card>
    </div>
  );
};

export default DashboardPage;
