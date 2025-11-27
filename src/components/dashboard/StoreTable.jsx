import React, { useMemo } from "react";
import SortableTable from "../tables/SortableTable";

const StoreTable = ({ rows = [], loading = false, error }) => {
  const safeRows = useMemo(() => rows, [rows]);

  const columns = [
    { key: "store", header: "Store Name" },
    { key: "city", header: "City" },
    { key: "osa", header: "OSA %", render: (value) => (typeof value === "number" ? `${value.toFixed(1)}%` : "--") },
    { key: "sos", header: "SoS %", render: (value) => (typeof value === "number" ? `${value.toFixed(1)}%` : "--") },
    { key: "pgc", header: "PGC %", render: (value) => (typeof value === "number" ? `${value.toFixed(1)}%` : "--") },
    { key: "images", header: "Images Uploaded" },
  ];

  return (
    <>
      {error && <div className="mb-3 text-sm text-red-600">Error: {error}</div>}
      <SortableTable
        columns={columns}
        rows={safeRows}
        initialSort={{ key: "osa", dir: "desc" }}
        empty={loading ? "Loading..." : "No data"}
      />
    </>
  );
};

export default StoreTable;
