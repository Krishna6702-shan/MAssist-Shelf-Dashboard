import React, { useState, useEffect } from "react";
import { Badge, Button, Card, Field } from "../components/ui";
import apiConfig from "../config/apiConfig";

const baseUrl = apiConfig.baseUrl;

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
      const response = await fetch(`${baseUrl}/api/org/list`, {
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
      const response = await fetch(`${baseUrl}/api/org/${selectedOrgId}/shops`, {
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
                    <span className="text-gray-600">Planogram Rows:</span>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {shop.planogram ? shop.planogram.length : 0} rows
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Products:</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {shop.no_of_products || 0} SKUs
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Facings (OSA):</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {shop.facings ? Object.keys(shop.facings).length : 0} items
                    </Badge>
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

// ============================================================================
// ADD SHOP MODAL - TWO SECTIONS: PLANOGRAM (PGC) & FACINGS (OSA)
// ============================================================================

const AddShopModal = ({ orgId, orgName, onClose, onSuccess }) => {
  const [shopId, setShopId] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopType, setShopType] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // ✅ SECTION 1: Planogram (for PGC) - ARRAY
  const [planogramFile, setPlanogramFile] = useState(null);
  const [planogramProducts, setPlanogramProducts] = useState([]);

  // ✅ SECTION 2: Facings (for OSA) - DICT
  const [orgSkus, setOrgSkus] = useState([]);
  const [facingsData, setFacingsData] = useState([]);
  const [selectedSkuId, setSelectedSkuId] = useState("");
  const [facingsCount, setFacingsCount] = useState("");

  // Fetch organization SKUs on mount
  useEffect(() => {
    fetchOrgSkus();
  }, []);

  const fetchOrgSkus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${baseUrl}/api/org/${orgId}/skus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setOrgSkus(result.skus || []);
      }
    } catch (err) {
      console.error("Failed to fetch SKUs:", err);
    }
  };

  // ====== PLANOGRAM SECTION (PGC) - ARRAY ======

  const handlePlanogramFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError("Please upload CSV or Excel file only");
      return;
    }

    setPlanogramFile(file);
    setError("");
    await parsePlanogramFile(file);
  };

  const parsePlanogramFile = async (file) => {
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target.result;

        if (file.name.toLowerCase().endsWith('.csv')) {
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

          const parsed = [];
          const invalidValues = ['nan', 'n/a', 'na', 'null', 'none', '', 'N/A', 'NaN', 'NULL', 'None'];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',').map(v => v.trim());
            let skuId = values[skuIdIndex];
            let skuName = values[skuNameIndex];

            // ✅ Convert invalid values to null
            if (invalidValues.includes(skuId) || !skuId) {
              skuId = null;
            }

            if (invalidValues.includes(skuName) || !skuName) {
              skuName = null;
            }

            // ✅ Add to array (preserves order, allows nulls and duplicates)
            parsed.push({ sku_id: skuId, sku_name: skuName });
          }

          setPlanogramProducts(parsed);
          setError("");

          if (parsed.length === 0) {
            setError("No products found in CSV");
          }
        }
      };

      reader.readAsText(file);
    } catch (err) {
      setError(`File parsing failed: ${err.message}`);
    }
  };

  // ====== FACINGS SECTION (OSA) - DICT ======

  const handleAddFacing = () => {
    if (!selectedSkuId) {
      setError("Please select a SKU");
      return;
    }
    if (!facingsCount || parseInt(facingsCount) < 0) {
      setError("Please enter valid number of facings");
      return;
    }

    const exists = facingsData.find(f => f.sku_id === selectedSkuId);
    if (exists) {
      setError("This SKU already added");
      return;
    }

    const sku = orgSkus.find(s => s.sku_id === selectedSkuId);
    if (!sku) {
      setError("SKU not found");
      return;
    }

    setFacingsData([
      ...facingsData,
      {
        sku_id: selectedSkuId,
        sku_name: sku.sku_name,
        facings: parseInt(facingsCount)
      }
    ]);

    setSelectedSkuId("");
    setFacingsCount("");
    setError("");
  };

  const handleRemoveFacing = (index) => {
    setFacingsData(facingsData.filter((_, i) => i !== index));
  };

  const handleUpdateFacings = (index, newFacings) => {
    const updated = [...facingsData];
    updated[index].facings = parseInt(newFacings) || 0;
    setFacingsData(updated);
  };

  // ====== CREATE SHOP ======

  const handleCreate = async () => {
    if (!shopId.trim() || !shopName.trim() || !shopLocation.trim() || !shopType.trim()) {
      setError("All shop details are required");
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

      // ✅ Add planogram file
      if (planogramFile) {
        formData.append("planogram_file", planogramFile);
      }

      // ✅ Add facings data as JSON
      if (facingsData.length > 0) {
        const facingsDict = {};
        facingsData.forEach(item => {
          facingsDict[item.sku_id] = {
            sku_name: item.sku_name,
            facings: item.facings
          };
        });
        formData.append("facings_data", JSON.stringify(facingsDict));
      }

      const response = await fetch(`${baseUrl}/api/org/${orgId}/add-shop`, {
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

  const selectedSku = orgSkus.find(s => s.sku_id === selectedSkuId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-5xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Add Shop to {orgName}</h2>
            <p className="text-sm text-gray-500 mt-1">Configure shop details, planogram, and facings</p>
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
          <div className="border-b pb-6">
            <h3 className="text-lg font-bold mb-4">Shop Details</h3>
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
          </div>

          {/* SECTION 1: Planogram Upload (for PGC) */}
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Planogram (For PGC)</h3>
                <p className="text-sm text-gray-500">Upload CSV/Excel - preserves exact order for row-by-row comparison</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {planogramProducts.length} rows
              </Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV/Excel (Columns: <code className="bg-gray-100 px-2 py-1 rounded">sku_id</code>, <code className="bg-gray-100 px-2 py-1 rounded">sku_name</code>)
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handlePlanogramFileSelect}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                disabled={creating}
              />
              {planogramFile && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ {planogramFile.name} - {planogramProducts.length} rows loaded (order preserved)
                </p>
              )}
            </div>

            {planogramProducts.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200 max-h-60 overflow-y-auto">
                <div className="text-xs font-medium text-purple-900 mb-2">Preview (First 10 rows):</div>
                <div className="space-y-1">
                  {planogramProducts.slice(0, 10).map((product, idx) => (
                    <div key={idx} className="text-xs flex justify-between items-center bg-white p-2 rounded">
                      <span className="text-gray-500 font-mono w-8">{idx + 1}.</span>
                      <span className="font-mono text-purple-700 flex-1">
                        {product.sku_id || 'null'}
                      </span>
                      <span className="text-gray-600 flex-1 text-right truncate">
                        {product.sku_name || 'null'}
                      </span>
                    </div>
                  ))}
                  {planogramProducts.length > 10 && (
                    <div className="text-xs text-center text-gray-500 pt-2">
                      ... and {planogramProducts.length - 10} more rows
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Number of Facings (for OSA) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Number of Facings (For OSA)</h3>
                <p className="text-sm text-gray-500">Select products from your SKU database and add facings</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {facingsData.length} products
              </Badge>
            </div>

            {/* Add Facings Form */}
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 mb-4">
              <h4 className="font-medium text-green-900 mb-3">Add Product Facings</h4>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <select
                    value={selectedSkuId}
                    onChange={(e) => setSelectedSkuId(e.target.value)}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    disabled={creating}
                  >
                    <option value="">-- Select SKU ID --</option>
                    {orgSkus.map(sku => (
                      <option key={sku.sku_id} value={sku.sku_id}>
                        {sku.sku_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    value={selectedSku?.sku_name || ""}
                    placeholder="SKU Name (auto-filled)"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={facingsCount}
                    onChange={(e) => setFacingsCount(e.target.value)}
                    placeholder="Facings"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    disabled={creating}
                  />
                </div>
              </div>
              <button
                onClick={handleAddFacing}
                className="mt-3 w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                disabled={creating}
              >
                + Add Product Facings
              </button>
            </div>

            {/* Facings List */}
            {facingsData.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {facingsData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{item.sku_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{item.sku_id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 whitespace-nowrap">Facings:</label>
                      <input
                        type="number"
                        min="0"
                        value={item.facings}
                        onChange={(e) => handleUpdateFacings(index, e.target.value)}
                        className="w-20 p-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                        disabled={creating}
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveFacing(index)}
                      className="text-red-600 hover:text-red-800 text-xl font-bold"
                      disabled={creating}
                    >
                      ×
                    </button>
                  </div>
                ))}
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
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !shopId.trim() || !shopName.trim() || !shopLocation.trim() || !shopType.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
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

export default ShopManagementPage;
