import React, { useState, useEffect } from "react";
import { Badge, Button, Card } from "../components/ui";

const OrganizationDetailsPage = ({ setPage, selectedOrgId, setSelectedOrgId }) => {
  const [organization, setOrganization] = useState(null);
  const [activeTab, setActiveTab] = useState("skus");
  const [skus, setSkus] = useState([]);
  const [shops, setShops] = useState([]);  // ✅ NEW: Shops state
  const [loading, setLoading] = useState(true);
  const [shopsLoading, setShopsLoading] = useState(false);  // ✅ NEW: Shops loading
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddShopModal, setShowAddShopModal] = useState(false);  // ✅ NEW: Add shop modal

  useEffect(() => {
    if (selectedOrgId) {
      fetchOrganizationDetails();
      fetchSKUs();
      fetchShops();  // ✅ NEW: Fetch shops on load
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

  // ✅ NEW: Fetch shops function
  const fetchShops = async () => {
    try {
      setShopsLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/org/${selectedOrgId}/shops`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setShops(result.shops || []);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setShopsLoading(false);
    }
  };

  const filteredSkus = skus.filter(sku =>
    sku.sku_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.sku_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ NEW: Filter shops
  const filteredShops = shops.filter(shop =>
    shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.shop_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={() => setPage('sku')}
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
          Shops ({shops.length})
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
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{sku.sku_name}</h3>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                        {sku.sku_id}
                      </p>
                    </div>
                    <Badge tone="green" className="text-xs">Active</Badge>
                  </div>

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
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ✅ NEW: Shops Tab - Display shops like SKUs */}
      {activeTab === "shops" && (
        <Card>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Shop Locations</h2>
              <div className="flex gap-2">
                <Button onClick={fetchShops} variant="secondary">
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowAddShopModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Shop
                </Button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search by shop name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {shopsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <div className="mt-4 text-gray-600">Loading shops...</div>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏪</div>
              <div className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No shops found' : 'No shops yet'}
              </div>
              <div className="text-gray-500 mb-6">
                {searchTerm ? 'Try a different search term' : `Add your first shop to ${organization.org_name}`}
              </div>
              <Button
                onClick={() => setShowAddShopModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Add First Shop
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <div
                  key={shop.shop_id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{shop.shop_name}</h3>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                        {shop.shop_id}
                      </p>
                    </div>
                    <Badge tone="green" className="text-xs">Active</Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="text-sm font-semibold text-gray-900">{shop.shop_location}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Type</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {shop.shop_type}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Added</span>
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
      )}

      {/* ✅ NEW: Add Shop Modal */}
      {showAddShopModal && (
        <AddShopModal
          orgId={selectedOrgId}
          orgName={organization.org_name}
          onClose={() => setShowAddShopModal(false)}
          onSuccess={() => {
            setShowAddShopModal(false);
            fetchShops();
          }}
        />
      )}
    </div>
  );
};

const AddShopModal = ({ orgId, orgName, onClose, onSuccess }) => {
  const [shopId, setShopId] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopType, setShopType] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // ✅ Planogram states
  const [selectedFile, setSelectedFile] = useState(null);
  const [products, setProducts] = useState([]);  // Array instead of object

  // ✅ New product form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkuId, setNewSkuId] = useState("");
  const [newSkuName, setNewSkuName] = useState("");
  const [newFacings, setNewFacings] = useState("");

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError("Please upload CSV or Excel file only");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Parse file
    await parseFile(file);
  };

  const parseFile = async (file) => {
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target.result;

        if (file.name.toLowerCase().endsWith('.csv')) {
          // Parse CSV
          const lines = text.split('\n').filter(line => line.trim());

          if (lines.length === 0) {
            setError("CSV file is empty");
            return;
          }

          const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

          const skuIdIndex = headers.indexOf('sku_id');
          const skuNameIndex = headers.indexOf('sku_name');

          if (skuIdIndex === -1 || skuNameIndex === -1) {
            setError("CSV must have 'sku_id' and 'sku_name' columns");
            return;
          }

          const parsedProducts = [];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.trim());
            const skuId = values[skuIdIndex];
            const skuName = values[skuNameIndex];

            if (skuId && skuName && skuId.toLowerCase() !== 'nan' && skuName.toLowerCase() !== 'nan') {
              parsedProducts.push({
                sku_id: skuId,
                sku_name: skuName,
                facings: 0  // Default to 0, user will fill
              });
            }
          }

          setProducts(parsedProducts);
          setError("");

          if (parsedProducts.length === 0) {
            setError("No valid products found in CSV");
          }
        }
      };

      reader.readAsText(file);

    } catch (err) {
      setError(`File parsing failed: ${err.message}`);
    }
  };

  const handleAddProduct = () => {
    // Validation
    if (!newSkuId.trim()) {
      setError("SKU ID is required");
      return;
    }
    if (!newSkuName.trim()) {
      setError("SKU Name is required");
      return;
    }
    if (!newFacings || parseInt(newFacings) < 0) {
      setError("Valid number of facings is required");
      return;
    }

    // Check duplicate
    const exists = products.find(p => p.sku_id === newSkuId.trim());
    if (exists) {
      setError("This SKU ID already exists");
      return;
    }

    // Add product
    setProducts([
      ...products,
      {
        sku_id: newSkuId.trim(),
        sku_name: newSkuName.trim(),
        facings: parseInt(newFacings)
      }
    ]);

    // Reset form
    setNewSkuId("");
    setNewSkuName("");
    setNewFacings("");
    setShowAddForm(false);
    setError("");
  };

  const handleUpdateFacings = (index, facings) => {
    const updatedProducts = [...products];
    updatedProducts[index].facings = parseInt(facings) || 0;
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleCreate = async () => {
    // Validation
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

      // Convert products array to planogram object
      const planogram = {};
      products.forEach(product => {
        planogram[product.sku_id] = {
          sku_name: product.sku_name,
          facings: product.facings
        };
      });

      const formData = new FormData();
      formData.append("shop_id", shopId.trim());
      formData.append("shop_name", shopName.trim());
      formData.append("shop_location", shopLocation.trim());
      formData.append("shop_type", shopType.trim());

      // Add planogram as JSON
      if (Object.keys(planogram).length > 0) {
        formData.append("planogram_data", JSON.stringify(planogram));
      }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Add Shop to {orgName}</h2>
            <p className="text-sm text-gray-500 mt-1">Add retail location with planogram</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={creating}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Shop Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop ID *</label>
              <input
                type="text"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                placeholder="e.g., SHOP001"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={creating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g., Big Bazaar Phoenix"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={creating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={shopLocation}
                onChange={(e) => setShopLocation(e.target.value)}
                placeholder="e.g., Mumbai, Maharashtra"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={creating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Type *</label>
              <input
                type="text"
                value={shopType}
                onChange={(e) => setShopType(e.target.value)}
                placeholder="e.g., Retail Store"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={creating}
              />
            </div>
          </div>

          {/* Planogram Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Planogram (Optional)</h3>
              <span className="text-sm text-gray-500">{products.length} products</span>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV/Excel (Columns: <code className="bg-gray-100 px-2 py-1 rounded">sku_id</code>, <code className="bg-gray-100 px-2 py-1 rounded">sku_name</code>)
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={creating}
              />
              {selectedFile && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ {selectedFile.name} - {products.length} products loaded
                </p>
              )}
            </div>

            {/* Products List */}
            {products.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-3 text-gray-700">Products & Facings</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {products.map((product, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {product.sku_name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {product.sku_id}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 whitespace-nowrap">Facings:</label>
                        <input
                          type="number"
                          min="0"
                          value={product.facings}
                          onChange={(e) => handleUpdateFacings(index, e.target.value)}
                          className="w-20 p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                          disabled={creating}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-600 hover:text-red-800 text-xl font-bold"
                        disabled={creating}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Product Form */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full p-3 border-2 border-dashed border-blue-400 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                disabled={creating}
              >
                + Add Product Manually
              </button>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">Add New Product</h4>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewSkuId("");
                      setNewSkuName("");
                      setNewFacings("");
                      setError("");
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newSkuId}
                    onChange={(e) => setNewSkuId(e.target.value)}
                    placeholder="SKU ID"
                    className="p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newSkuName}
                    onChange={(e) => setNewSkuName(e.target.value)}
                    placeholder="SKU Name"
                    className="p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newFacings}
                    onChange={(e) => setNewFacings(e.target.value)}
                    placeholder="Facings"
                    className="p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  className="mt-3 w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Product
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={creating}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !shopId.trim() || !shopName.trim() || !shopLocation.trim() || !shopType.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Adding Shop...
                </span>
              ) : (
                "Add Shop"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default OrganizationDetailsPage;