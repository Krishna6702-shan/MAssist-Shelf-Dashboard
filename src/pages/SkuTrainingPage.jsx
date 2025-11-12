import React, { useState, useEffect } from "react";
import { Badge, Button, Card } from "../components/ui";
import SortableTable from "../components/tables/SortableTable";
const BaseURL = 'http://localhost:8000';
const SkuTrainingPage = ({ selectedBrand, setPage }) => {
  const [actionOpenIndex, setActionOpenIndex] = useState(null);
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const brandName = typeof selectedBrand === 'object' ? selectedBrand.name : selectedBrand;

  const fetchSkus = async () => {
    if (!brandName) {
      setError(new Error('No brand selected'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BaseURL}/skus-by-brand/${encodeURIComponent(brandName)}`);
      const result = await response.json();
      if (result.success) {
        setSkus(result.skus || []);
      } else {
        setError(new Error(result.error || 'Failed to fetch SKUs'));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkus();
  }, [brandName]);

  if (!brandName) {
    return (
      <Card title="SKU Training" subtitle="No brand selected.">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-lg font-medium text-gray-600">Please select a brand first</div>
          <Button onClick={() => setPage?.("sku")}>Go to Brands</Button>
        </div>
      </Card>
    );
  }

  const handleDeleteSku = async (skuName) => {
    if (confirm(`Are you sure you want to delete "${skuName}"? This will only hide it from display.`)) {
      try {
        const response = await fetch(`${BaseURL}/delete-sku/${encodeURIComponent(skuName)}`, {
          method: 'DELETE'
        });
        const result = await response.json();

        if (result.success) {
          alert(`SKU "${skuName}" deleted from display`);
          fetchSkus();
        } else {
          alert(`Failed to delete SKU: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        alert(`Failed to delete SKU: ${error.message}`);
      }
    }
    setActionOpenIndex(null);
  };

  if (loading) {
    return (
      <Card title={`SKU Training - ${brandName}`} subtitle="Loading SKUs...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="mt-4">Loading SKUs...</div>
        </div>
      </Card>
    );
  }

  if (error || !brandName) {
    return (
      <Card title={`SKU Training - ${brandName || 'No Brand'}`} subtitle="Error loading SKUs.">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-600 mb-4">
            Error: {error?.message || 'No brand selected'}
          </div>
          <Button onClick={() => brandName ? fetchSkus() : setPage?.("sku")}>
            {brandName ? 'Retry' : 'Go to Brands'}
          </Button>
        </div>
      </Card>
    );
  }

  const columns = [
  {
    key: "sku_name",
    header: "SKU Name",
    render: (value) => (
      <div className="font-medium">{value}</div>
    ),
  },
  {
    key: "facings_count",
    header: "Facings",
    render: (value) => (
      <div className="text-center">
        <Badge className="bg-purple-100 text-purple-800">
          {value || 10} facings
        </Badge>
      </div>
    ),
  },
  {
    key: "image_count",
    header: "No. of Images",
    render: (value) => (
      <div className="text-center">
        <Badge className="bg-blue-100 text-blue-800">
          {value} image{value !== 1 ? 's' : ''}
        </Badge>
      </div>
    ),
  },
  {
    key: "added_by",
    header: "Added By",
    render: (value) => value || "Unknown"
  },
  {
    key: "created_on",
    header: "Created On",
    render: (value) => {
      if (!value) return "--";
      const date = new Date(value);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  },
  {
    key: "training_status",
    header: "Training Status",
    render: (value) => (
      <Badge tone="green">
        Trained
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (_, row, idx) => (
      <div className="relative inline-block">
        <Button
          variant="secondary"
          className="gap-1 bg-red-50 text-red-600 hover:bg-red-100"
          onClick={() => handleDeleteSku(row.sku_name)}
        >
          Delete
        </Button>
      </div>
    ),
  },
];

  return (
    <Card
      title={`SKU Training - ${brandName}`}
      subtitle={`Upload and track SKU data to improve recognition accuracy. ${skus.length} SKUs found.`}
      actions={
        <div className="flex gap-2">
          <Button onClick={() => setPage?.("sku")}>← Back to Brands</Button>
          <Button variant="secondary" onClick={() => fetchSkus()} disabled={loading}>
            Refresh
          </Button>
        </div>
      }
    >
      {skus.length > 0 ? (
        <>
          <SortableTable columns={columns} rows={skus} />

          <div className="mt-6 text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-semibold">Total SKUs</div>
                <div className="text-lg">{skus.length}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="font-semibold">Total Images</div>
                <div className="text-lg">{skus.reduce((sum, sku) => sum + (sku.image_count || 0), 0)}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="font-semibold">Trained</div>
                <div className="text-lg">{skus.filter(sku => sku.training_status === "Done").length}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="font-semibold">Pending</div>
                <div className="text-lg">{skus.filter(sku => sku.training_status !== "Done").length}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-lg font-medium text-gray-600">No SKUs found for {brandName}</div>
          <div className="text-sm text-gray-500 mb-6">Upload some SKUs using the Upload SKU button</div>
          <Button onClick={() => setPage?.("sku")}>← Back to Brands</Button>
        </div>
      )}
    </Card>
  );
};

export default SkuTrainingPage;