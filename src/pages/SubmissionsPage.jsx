import React, { useMemo, useState } from "react";
import { Icon } from "../components/icons";
import { Button, Card } from "../components/ui";
import SortableTable from "../components/tables/SortableTable";
import { fetchAnalysisReports } from "../services/apiService";
import { useApiRequest } from "../hooks/useApiRequest";

const SubmissionsPage = () => {
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState("All Locations");
  const [actionOpenIndex, setActionOpenIndex] = useState(null);

  const { data: reportsData, loading, error, refetch } = useApiRequest(fetchAnalysisReports);

  const apiRows = useMemo(() => {
    if (!reportsData?.reports || reportsData.reports.length === 0) return [];

    return reportsData.reports.map((report, index) => ({
      filename: report.filename,
      sessionId: report.session_id,
      reportType: report.report_type,
      fileSize: report.file_size_mb,
      createdDate: report.created_date,
      downloadUrl: report.download_url,
      // Extract metrics from filename or use defaults
      image: `https://picsum.photos/seed/${report.session_id}/160/100`,
      by: "Field Agent", // Could be enhanced with user data
      store: report.session_id.includes('analysis') ? "Store Analysis" : "Unknown Store",
      date: report.created_date,
      osa: 0, // These would come from parsed CSV data
      sos: 0,
      pgc: 0,
      city: "Mumbai" // Could be enhanced with location data
    }));
  }, [reportsData]);

  const locations = useMemo(() => {
    const uniqueCities = new Set(apiRows.map((row) => row.city || "All Locations"));
    return ["All Locations", ...Array.from(uniqueCities).filter((city) => city !== "All Locations")];
  }, [apiRows]);

  const rows = apiRows.filter((row) => location === "All Locations" || row.city === location);

  const handleDownload = (downloadUrl, filename) => {
    window.open(downloadUrl, '_blank');
  };

  const handleViewReport = (sessionId) => {
    alert(`Viewing detailed report for session: ${sessionId}`);
    // Could open a modal or navigate to detailed view
  };

  const columns = [
    {
      key: "image",
      header: "Analysis",
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <img src={value} alt="analysis" className="h-16 w-28 rounded object-cover" />
          <div className="text-xs text-gray-500">
            <div>{row.reportType}</div>
            <div>{row.fileSize} MB</div>
          </div>
        </div>
      ),
    },
    {
      key: "sessionId",
      header: "Session ID",
      render: (value) => (
        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
          {value.substring(0, 12)}...
        </div>
      )
    },
    { key: "store", header: "Store/Type" },
    { key: "date", header: "Created Date" },
    {
      key: "osa",
      header: "OSA %",
      render: (value) => (
        <span className="text-blue-600 font-semibold">
          {value > 0 ? `${value.toFixed(1)}%` : "N/A"}
        </span>
      )
    },
    {
      key: "sos",
      header: "SoS %",
      render: (value) => (
        <span className="text-green-600 font-semibold">
          {value > 0 ? `${value.toFixed(1)}%` : "N/A"}
        </span>
      )
    },
    {
      key: "pgc",
      header: "PGC %",
      render: (value) => (
        <span className="text-purple-600 font-semibold">
          {value > 0 ? `${value.toFixed(1)}%` : "N/A"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row, idx) => (
        <div className="relative inline-block">
          <Button
            variant="secondary"
            className="gap-1"
            onClick={() => setActionOpenIndex(actionOpenIndex === idx ? null : idx)}
            aria-expanded={actionOpenIndex === idx}
          >
            Action <Icon.chevronDown className="h-4 w-4" />
          </Button>
          {actionOpenIndex === idx && (
            <div className="glass absolute right-0 z-10 mt-1 w-40 rounded-xl border border-black/15 bg-white p-1">
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-black/5"
                onClick={() => {
                  setActionOpenIndex(null);
                  handleDownload(row.downloadUrl, row.filename);
                }}
              >
                Download CSV
              </button>
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-black/5"
                onClick={() => {
                  setActionOpenIndex(null);
                  handleViewReport(row.sessionId);
                }}
              >
                View Details
              </button>
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-black/5 text-red-600"
                onClick={() => {
                  setActionOpenIndex(null);
                  if (confirm(`Delete report ${row.filename}?`)) {
                    alert("Delete functionality to be implemented");
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card
      title="Analysis Reports"
      subtitle={`Review analysis reports generated by the system. ${reportsData?.count || 0} reports available (${reportsData?.total_size_mb || 0} MB total)`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <div className="relative">
            <Button
              variant="secondary"
              className="gap-1"
              onClick={() => setLocationOpen((value) => !value)}
              aria-expanded={locationOpen}
            >
              {location} <Icon.chevronDown className="h-4 w-4" />
            </Button>
            {locationOpen && (
              <div className="glass absolute right-0 z-10 mt-1 w-48 rounded-xl border border-black/15 bg-white p-1">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-black/5"
                    onClick={() => {
                      setLocation(loc);
                      setLocationOpen(false);
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading reports: {error.message}
        </div>
      )}

      <SortableTable columns={columns} rows={rows} />

      {loading && (
        <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          Loading analysis reports...
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="mt-8 text-center text-gray-500 py-8">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium">No analysis reports found</div>
          <div className="text-sm">Reports will appear here after users submit shelf analyses</div>
        </div>
      )}
    </Card>
  );
};

export default SubmissionsPage;