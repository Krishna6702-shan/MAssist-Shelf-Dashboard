import React, { useState, useEffect } from "react";
import { Badge, Button, Card, Field } from "../components/ui";

const ShopManagementPage = ({ setPage, selectedOrgId, setSelectedOrgId }) => {
  const [organizations, setOrganizations] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchShops();
    } else {
      setShops([]);
    }
  }, [selectedOrgId]);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/org/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setOrganizations(result.organizations || []);
        if (result.organizations?.length > 0 && !selectedOrgId) {
          setSelectedOrgId(result.organizations[0].org_id);
        }
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/org/${selectedOrgId}/shops`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setShops(result.shops || []);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrg = organizations.find(org => org.org_id === selectedOrgId);

  return (
    <>
      <Card
        title="Shop Management"
        subtitle="Manage retail locations for your organizations"
        actions={
          <div className="flex gap-2">
            <Button onClick={fetchShops} variant="secondary">
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedOrgId}
            >
              Add Shop
            </Button>
          </div>
        }
      >
        {/* Organization Selector */}
        <div className="mb-6">
          <Field label="Select Organization">
            <select
              value={selectedOrgId || ""}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full max-w-md p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select an organization --</option>
              {organizations.map((org) => (
                <option key={org.org_id} value={org.org_id}>
                  {org.org_name} - {org.shop_count || 0} shops
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!selectedOrgId ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏪</div>
            <div className="text-lg font-medium text-gray-600">Please select an organization</div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <div className="mt-4 text-gray-600">Loading shops...</div>
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏪</div>
            <div className="text-lg font-medium text-gray-600">No shops found</div>
            <div className="text-sm text-gray-500 mb-6">
              Add your first shop to <strong>{selectedOrg?.org_name}</strong>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Add First Shop
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop.shop_id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{shop.shop_name}</h3>
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      {shop.shop_id}
                    </p>
                  </div>
                  <Badge tone="green" className="text-xs">Active</Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{shop.shop_location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">{shop.shop_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Added:</span>
                    <span className="text-xs text-gray-500">
                      {new Date(shop.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showAddModal && selectedOrgId && (
        <AddShopModal
          orgId={selectedOrgId}
          orgName={selectedOrg?.org_name}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchShops();
          }}
        />
      )}
    </>
  );
};

const AddShopModal = ({ orgId, orgName, onClose, onSuccess }) => {
  const [shopId, setShopId] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopType, setShopType] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!shopId.trim()) {
      setError("Shop ID is required");
      return;
    }
    if (!shopName.trim()) {
      setError("Shop name is required");
      return;
    }
    if (!shopLocation.trim()) {
      setError("Shop location is required");
      return;
    }
    if (!shopType.trim()) {
      setError("Shop type is required");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("Please login again");
        return;
      }

      const formData = new FormData();
      formData.append("shop_id", shopId.trim());
      formData.append("shop_name", shopName.trim());
      formData.append("shop_location", shopLocation.trim());
      formData.append("shop_type", shopType.trim());

      const response = await fetch(`http://localhost:8000/api/org/${orgId}/add-shop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.detail || result.message || "Failed to add shop");
      }
    } catch (err) {
      setError(`Failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Add Shop to {orgName}</h2>
            <p className="text-sm text-gray-500 mt-1">Add retail location details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={creating}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Shop ID">
            <input
              type="text"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="e.g., SHOP001, BIG_BAZAAR_PHX"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={creating}
            />
          </Field>

          <Field label="Shop Name">
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g., Big Bazaar Phoenix"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={creating}
            />
          </Field>

          <Field label="Shop Location">
            <input
              type="text"
              value={shopLocation}
              onChange={(e) => setShopLocation(e.target.value)}
              placeholder="e.g., Mumbai, Maharashtra"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={creating}
            />
          </Field>

          <Field label="Shop Type">
            <input
              type="text"
              value={shopType}
              onChange={(e) => setShopType(e.target.value)}
              placeholder="e.g., Retail Store, Warehouse, Outlet"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={creating}
            />
          </Field>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !shopId.trim() || !shopName.trim() || !shopLocation.trim() || !shopType.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {creating ? "Adding..." : "Add Shop"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopManagementPage;