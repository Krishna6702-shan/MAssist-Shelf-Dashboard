import React, { useState, useEffect, useRef } from "react";
import { Badge, Button, Card, Field } from "../components/ui";
import SortableTable from "../components/tables/SortableTable";
import apiConfig from "../config/apiConfig";

const baseUrl = apiConfig.baseUrl;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SkuTrainingPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch user's organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Fetch SKUs when organization is selected
  useEffect(() => {
    if (selectedOrgId) {
      fetchSkus(selectedOrgId);
    } else {
      setSkus([]);
    }
  }, [selectedOrgId]);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`${baseUrl}/api/org/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        window.location.href = '/';
        return;
      }

      const result = await response.json();
      if (result.success) {
        setOrganizations(result.organizations || []);
        
        // Auto-select first organization if available
        if (result.organizations && result.organizations.length > 0) {
          setSelectedOrgId(result.organizations[0].org_id);
        }
      } else {
        setError(result.error || 'Failed to fetch organizations');
      }
    } catch (err) {
      setError(`Failed to fetch organizations: ${err.message}`);
    }
  };

  const fetchSkus = async (orgId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${baseUrl}/api/org/${orgId}/skus`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        window.location.href = '/';
        return;
      }

      const result = await response.json();
      if (result.success) {
        setSkus(result.skus || []);
      } else {
        setError(result.error || 'Failed to fetch SKUs');
      }
    } catch (err) {
      setError(`Failed to fetch SKUs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    if (selectedOrgId) {
      fetchSkus(selectedOrgId);
    }
  };

  const selectedOrg = organizations.find(org => org.org_id === selectedOrgId);

  const columns = [
    {
      key: "sku_name",
      header: "SKU Name",
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      key: "brand_name",
      header: "Brand",
      render: (value) => value || "Unknown"
    },
    {
      key: "image_count",
      header: "Images",
      render: (value) => (
        <Badge className="bg-blue-100 text-blue-800">
          {value} image{value !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: "training_status",
      header: "Status",
      render: () => <Badge tone="green">Trained</Badge>,
    },
    {
      key: "created_on",
      header: "Created On",
      render: (value) => {
        if (!value) return "--";
        const date = new Date(value);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    },
  ];

  return (
    <>
      <Card
        title="SKU Training"
        subtitle="Manage SKUs for your organizations"
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => fetchSkus(selectedOrgId)}
              variant="secondary"
              disabled={!selectedOrgId || loading}
            >
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedOrgId}
            >
              Add SKU
            </Button>
          </div>
        }
      >
        {/* Organization Selector */}
        <div className="mb-6">
          <Field label="Select Organization">
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full max-w-md p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="">-- Select an organization --</option>
              {organizations.map((org) => (
                <option key={org.org_id} value={org.org_id}>
                  {org.org_name} ({org.org_type}) - {org.sku_count} SKUs
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Content based on selection */}
        {!selectedOrgId ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏢</div>
            <div className="text-lg font-medium text-gray-600">Please select an organization</div>
            <div className="text-sm text-gray-500">Choose an organization above to view and manage SKUs</div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <div className="mt-4 text-gray-600">Loading SKUs...</div>
          </div>
        ) : skus.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <div className="text-lg font-medium text-gray-600">No SKUs found</div>
            <div className="text-sm text-gray-500 mb-6">
              Start by adding your first SKU to <strong>{selectedOrg?.org_name}</strong>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Add First SKU
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <strong>{skus.length}</strong> SKU{skus.length !== 1 ? 's' : ''} for <strong>{selectedOrg?.org_name}</strong>
              </div>
              <div className="text-xs text-gray-500">
                Organization: {selectedOrg?.org_type} • {selectedOrg?.location}
              </div>
            </div>
            <SortableTable columns={columns} rows={skus} />
          </>
        )}
      </Card>

      {showAddModal && selectedOrgId && (
        <AddSkuModal
          orgId={selectedOrgId}
          orgName={selectedOrg?.org_name}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </>
  );
};

// ============================================================================
// ADD SKU MODAL COMPONENT
// ============================================================================

const AddSkuModal = ({ orgId, orgName, onClose, onSuccess }) => {
  const [skuId, setSkuId] = useState("");           // ✅ NEW: User enters SKU ID
  const [skuName, setSkuName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      setError("Only image files are allowed");
      return;
    }

    if (imageFiles.length > 20) {
      setError("Maximum 20 images allowed");
      return;
    }

    setSelectedFiles(imageFiles);
    setError("");
  };

  const handleUpload = async () => {
    // Validation
    if (!skuId.trim()) {
      setError("SKU ID is required");
      return;
    }

    if (!skuName.trim()) {
      setError("SKU name is required");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(10);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("No authentication token found. Please login again.");
        setUploading(false);
        return;
      }

      setUploadProgress(30);

      const formData = new FormData();
      formData.append("sku_id", skuId.trim());        // ✅ NEW: User-provided SKU ID
      formData.append("sku_name", skuName.trim());
      selectedFiles.forEach(file => formData.append("files", file));

      setUploadProgress(50);

      const response = await fetch(`${baseUrl}/api/org/${orgId}/add-sku`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      setUploadProgress(80);

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setTimeout(() => window.location.href = '/', 2000);
        return;
      }

      const result = await response.json();
      setUploadProgress(100);

      if (result.success) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setError(result.detail || result.message || "Upload failed");
        setUploadProgress(0);
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      setUploadProgress(0);
    } finally {
      if (!error) {
        setTimeout(() => setUploading(false), 1000);
      } else {
        setUploading(false);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add SKU to {orgName}</h2>
            <p className="text-sm text-gray-500 mt-1">Brand will be auto-assigned from organization</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
            disabled={uploading}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* SKU ID & SKU Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="SKU ID">
              <input
                type="text"
                value={skuId}
                onChange={(e) => setSkuId(e.target.value)}
                placeholder="e.g., SKU001, COKE500"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                disabled={uploading}
              />
              <div className="text-xs text-gray-500 mt-1">
                Unique identifier for this product
              </div>
            </Field>

            <Field label="SKU Name">
              <input
                type="text"
                value={skuName}
                onChange={(e) => setSkuName(e.target.value)}
                placeholder="e.g., Coke 500ml"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                disabled={uploading}
              />
              <div className="text-xs text-gray-500 mt-1">
                Display name for the product
              </div>
            </Field>
          </div>

          {/* File Upload */}
          <Field label="SKU Images">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={uploading}
            />
            <div className="text-xs text-gray-500 mt-1">
              Upload multiple images for better recognition (max 20 images)
            </div>
          </Field>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900">Selected Files ({selectedFiles.length})</h4>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={uploading}
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 text-sm border border-blue-100">
                    <div className="font-medium truncate text-gray-900">{file.name}</div>
                    <div className="text-gray-500 text-xs mt-1">{formatFileSize(file.size)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Processing images...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!skuId.trim() || !skuName.trim() || selectedFiles.length === 0 || uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Processing...
                </span>
              ) : (
                "Add SKU"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default SkuTrainingPage;
