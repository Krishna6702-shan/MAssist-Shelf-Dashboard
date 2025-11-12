import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Field } from "../components/ui";

const SkuBrandsPage = ({ setPage, setSelectedBrand }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/brands-from-mongodb');
      const result = await response.json();
      if (result.success) {
        setBrands(result.brands || []);
      } else {
        setError(new Error(result.error || 'Failed to fetch brands'));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleUploadSuccess = () => {
    fetchBrands(); // Refresh brands data
    setShowUploadModal(false);
  };

  if (loading) {
    return (
      <Card title="Brands" subtitle="Loading brands from database...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="mt-4">Loading brands...</div>
        </div>
      </Card>
    );
  }

  if (error) {
            return (
      <Card title="Brands" subtitle="Error loading brands from database.">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-red-600 mb-4">Error: {error.message}</div>
          <Button onClick={() => fetchBrands()}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="Brands"
        subtitle={`${brands.length} brands currently active in the database.`}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Upload SKU
            </Button>
            <Button variant="secondary" onClick={() => fetchBrands()} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      >
        {brands.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <div key={brand.name} className="glass rounded-2xl border border-black/15 bg-white p-5 hover:shadow-lg transition-shadow">
                <div className="mb-3 text-4xl" aria-hidden="true">
                  {brand.logo}
                </div>
                <div className="text-base font-semibold">{brand.name}</div>
                <div className="text-sm text-gray-600">{brand.items} SKUs</div>
                <div className="text-xs text-gray-500">{brand.total_images} images</div>

                <div className="mt-4">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setSelectedBrand?.(brand);
                      setPage?.("skuTraining");
                    }}
                  >
                    View SKUs
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <div className="text-lg font-medium text-gray-600">No brands found</div>
            <div className="text-sm text-gray-500 mb-6">Upload some SKUs to see brands here</div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Upload First SKU
            </Button>
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadSkuModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          existingBrands={brands.map(b => b.name)}
        />
      )}
    </>
  );
};

const UploadSkuModal = ({ onClose, onSuccess, existingBrands }) => {
  const [brandName, setBrandName] = useState("");
  const [skuName, setSkuName] = useState("");
  const [addedBy, setAddedBy] = useState("Admin");
  const [facingsCount, setFacingsCount] = useState(10);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      setError("Only image files are allowed");
      return;
    }

    setSelectedFiles(imageFiles);
    setError("");
  };

  const handleUpload = async () => {
    if (!brandName.trim() || !skuName.trim()) {
      setError("Brand name and SKU name are required");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one image");
      return;
    }

    if (facingsCount < 1 || facingsCount > 100) {
      setError("Facings count must be between 1 and 100");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("brand_name", brandName.trim());
      formData.append("sku_name", skuName.trim());
      formData.append("added_by", addedBy.trim());
      formData.append("facings_count", facingsCount);
      selectedFiles.forEach(file => formData.append("files", file));

      const response = await fetch('http://localhost:8000/add-sku-with-brand', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Upload New SKU</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Brand Name">
              <div className="relative">
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., Bolas, VI-JOHN"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                  disabled={uploading}
                  list="existing-brands"
                />
                <datalist id="existing-brands">
                  {existingBrands.map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>
            </Field>

            <Field label="SKU Name">
              <input
                type="text"
                value={skuName}
                onChange={(e) => setSkuName(e.target.value)}
                placeholder="e.g., Cashew Nuts 500gm"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                disabled={uploading}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Number of Facings (for OSA calculation)">
              <input
                type="number"
                min="1"
                max="100"
                value={facingsCount}
                onChange={(e) => setFacingsCount(parseInt(e.target.value))}
                placeholder="e.g., 10"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                disabled={uploading}
              />
              <div className="text-xs text-gray-500 mt-1">
                Expected shelf facings for this product (1-100)
              </div>
            </Field>

            <Field label="Added By">
              <input
                type="text"
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                placeholder="Your name"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                disabled={uploading}
              />
            </Field>
          </div>

          <Field label="SKU Images">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
              disabled={uploading}
            />
          </Field>

          {selectedFiles.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Selected Files ({selectedFiles.length}):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="bg-white rounded p-3 text-sm">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!brandName.trim() || !skuName.trim() || selectedFiles.length === 0 || uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? "Uploading..." : "Upload SKU"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkuBrandsPage;