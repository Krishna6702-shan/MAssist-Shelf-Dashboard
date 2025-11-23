import React, { useState, useEffect } from "react";
import { Badge, Button, Card } from "../components/ui";

const OrganizationDetailsPage = ({ setPage, selectedOrgId }) => {
  const [organization, setOrganization] = useState(null);
  const [activeTab, setActiveTab] = useState("skus");
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedOrgId) {
      fetchOrganizationDetails();
      fetchSKUs();
    }
  }, [selectedOrgId]);

  const fetchOrganizationDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/org/${selectedOrgId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/';
        return;
      }

      const result = await response.json();
      if (result.success) {
        setOrganization(result.organization);
      } else {
        setError('Failed to fetch organization');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const fetchSKUs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/org/${selectedOrgId}/skus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setSkus(result.skus || []);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkus = skus.filter(sku =>
    sku.sku_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.sku_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Show loading if no org selected
  if (!selectedOrgId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🏢</div>
          <div className="text-lg text-gray-600">No organization selected</div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => setPage('sku')}  // ✅ Navigate back using setPage
          variant="secondary"
          className="mb-4"
        >
          ← Back to Organizations
        </Button>

        <Card>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{organization.org_name}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type</span>
                  <div className="font-semibold text-gray-900">{organization.org_type}</div>
                </div>
                <div>
                  <span className="text-gray-500">Location</span>
                  <div className="font-semibold text-gray-900">{organization.location}</div>
                </div>
                <div>
                  <span className="text-gray-500">Total SKUs</span>
                  <div className="font-semibold text-blue-600">{organization.sku_count || 0}</div>
                </div>
                <div>
                  <span className="text-gray-500">Shops</span>
                  <div className="font-semibold text-blue-600">{organization.shop_count || 0}</div>
                </div>
              </div>
            </div>
            <Badge tone="green">Active</Badge>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("skus")}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === "skus"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          SKUs ({skus.length})
        </button>
        <button
          onClick={() => setActiveTab("shops")}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === "shops"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Shops ({organization.shop_count || 0})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* SKUs Tab */}
      {activeTab === "skus" && (
        <Card>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Product Catalog</h2>
              <Button onClick={fetchSKUs} variant="secondary">
                Refresh
              </Button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by SKU name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <div className="mt-4 text-gray-600">Loading products...</div>
            </div>
          ) : filteredSkus.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No products found' : 'No products yet'}
              </div>
              <div className="text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Add your first SKU to get started'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkus.map((sku) => (
                <div
                  key={sku.sku_id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{sku.sku_name}</h3>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                        {sku.sku_id}
                      </p>
                    </div>
                    <Badge tone="green" className="text-xs">Active</Badge>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Brand</span>
                      <span className="text-sm font-semibold text-gray-900">{sku.brand_name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Images</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {sku.image_count} {sku.image_count === 1 ? 'image' : 'images'}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Embeddings</span>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        {sku.faiss_indices?.length || 0} vectors
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Added</span>
                      <span className="text-xs text-gray-500">
                        {new Date(sku.created_on).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-center text-gray-500">
                      Click for details (Coming soon)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Shops Tab */}
      {activeTab === "shops" && (
        <Card>
          <div className="text-center py-16">
            <div className="text-7xl mb-4">🏪</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Shops Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Manage retail locations and planograms for {organization.org_name}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* Dummy Shop Cards */}
              {[1, 2, 3].map((num) => (
                <div key={num} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-400">
                  <div className="text-3xl mb-2">🏪</div>
                  <div className="font-medium">Shop {num}</div>
                  <div className="text-sm">Coming soon</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrganizationDetailsPage;