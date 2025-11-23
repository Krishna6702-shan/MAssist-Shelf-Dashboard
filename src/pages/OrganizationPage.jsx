import React, { useState, useEffect } from "react";
import { Badge, Button, Card, Field } from "../components/ui";

const OrganizationPage = ({ page, setPage, setSelectedOrgId }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("No authentication token");
        return;
      }

      const response = await fetch('http://localhost:8000/api/org/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/';
        return;
      }

      const result = await response.json();
      if (result.success) {
        setOrganizations(result.organizations || []);
      } else {
        setError(result.error || 'Failed to fetch organizations');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (orgId) => {
    setSelectedOrgId(orgId);
    setPage('organizationDetails');
  };

  const orgTypeEmojis = {
    'Retail': '🛒',
    'Wholesale': '📦',
    'Distribution': '🚚',
    'Other': '🏢'
  };

  return (
    <>
      <Card
        title="Organizations"
        subtitle={`${organizations.length} organization${organizations.length !== 1 ? 's' : ''} available`}
        actions={
          <div className="flex gap-2">
            <Button onClick={fetchOrganizations} variant="secondary">
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Organization
            </Button>
          </div>
        }
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <div className="mt-4 text-gray-600">Loading organizations...</div>
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏢</div>
            <div className="text-lg font-medium text-gray-600">No organizations found</div>
            <div className="text-sm text-gray-500 mb-6">Create your first organization to get started</div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create First Organization
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div key={org.org_id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">
                    {orgTypeEmojis[org.org_type] || '🏢'}
                  </div>
                  <Badge tone="green">Active</Badge>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{org.org_name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {org.org_type}
                </p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{org.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shops:</span>
                    <Badge className="bg-blue-100 text-blue-800">{org.shop_count || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKUs:</span>
                    <Badge className="bg-purple-100 text-purple-800">{org.sku_count || 0}</Badge>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewDetails(org.org_id)}
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOrganizations();
          }}
        />
      )}
    </>
  );
};

const CreateOrganizationModal = ({ onClose, onSuccess }) => {
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("Retail");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const orgTypes = ["Retail", "Wholesale", "Distribution", "Other"];

  const handleCreate = async () => {
    if (!orgName.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!location.trim()) {
      setError("Location is required");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("org_name", orgName.trim());
      formData.append("org_type", orgType);
      formData.append("location", location.trim());

      const response = await fetch('http://localhost:8000/api/org/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.detail || result.message || "Failed to create organization");
      }
    } catch (err) {
      setError(`Failed to create organization: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create New Organization</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={creating}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Organization Name">
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., Reliance Retail, Big Bazaar"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={creating}
            />
          </Field>

          <Field label="Organization Type">
            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={creating}
            >
              {orgTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Field>

          <Field label="Location">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Mumbai, Maharashtra"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={creating}
            />
          </Field>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!orgName.trim() || !location.trim() || creating}
              className="bg-green-600 hover:bg-green-700"
            >
              {creating ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;