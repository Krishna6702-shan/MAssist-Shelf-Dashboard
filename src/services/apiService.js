import client, { get, postFormData, postJSON } from "../lib/apiClient";
import apiRoutes from "./apiRoutes";

/**
 * Fetch HTML home response.
 * @returns {Promise<string>}
 */
export const fetchHome = () => client.request(apiRoutes.home, { method: "GET", headers: { Accept: "text/html" } });

/**
 * @param {File} file - Cropped product image.
 * @param {AbortSignal} [signal]
 */
export const searchSimilarImages = (file, signal) => {
  const formData = new FormData();
  formData.append("file", file);
  return postFormData(apiRoutes.search, formData, { signal });
};

/**
 * @param {{selected_product: string,total_facings_in_category:number,shelf_analysis_results:Object}} payload
 * @param {AbortSignal} [signal]
 */
export const calculateMetrics = (payload, signal) => postJSON(apiRoutes.calculateMetrics, payload, { signal });

/**
 * @param {string} productSku
 * @param {File[]} files
 * @param {AbortSignal} [signal]
 */
export const addNewProduct = (productSku, files, signal) => {
  const formData = new FormData();
  formData.append("product_sku", productSku);
  files.forEach((file) => formData.append("files", file));
  return postFormData(apiRoutes.addNewProduct, formData, { signal });
};

/**
 * @param {{
 *  file: File,
 *  planogramFile?: File,
 *  selectedProduct?: string,
 *  totalFacingsInCategory?: number,
 *  similarityThreshold?: number,
 *  positionTolerance?: number,
 * }} options
 * @param {AbortSignal} [signal]
 */
export const analyzeShelfWithPlanogram = (options, signal) => {
  const formData = new FormData();
  formData.append("file", options.file);
  if (options.planogramFile) {
    formData.append("planogram_file", options.planogramFile);
  }
  if (options.selectedProduct) {
    formData.append("selected_product", options.selectedProduct);
  }
  if (typeof options.totalFacingsInCategory === "number") {
    formData.append("total_facings_in_category", String(options.totalFacingsInCategory));
  }
  if (typeof options.similarityThreshold === "number") {
    formData.append("similarity_threshold", String(options.similarityThreshold));
  }
  if (typeof options.positionTolerance === "number") {
    formData.append("position_tolerance", String(options.positionTolerance));
  }
  return postFormData(apiRoutes.analyzeShelfWithPlanogram, formData, { signal });
};

export const fetchAnalysisReports = (signal) => get(apiRoutes.analysisReports, { signal });
export const fetchShelfAnalysisStatus = (signal) => get(apiRoutes.shelfAnalysisStatus, { signal });
export const fetchDebugDatabase = (signal) => get(apiRoutes.debugDatabase, { signal });
export const fetchProducts = (signal) => get(apiRoutes.products, { signal });
export const fetchImages = (signal) => get(apiRoutes.images, { signal });
export const fetchHealth = (signal) => get(apiRoutes.health, { signal });
export const fetchCroppingGuide = (signal) => get(apiRoutes.croppingGuide, { signal });


/**
 * @param {string} brandName
 * @param {string} skuName
 * @param {string} addedBy
 * @param {File[]} files
 * @param {AbortSignal} [signal]
 */
export const addSkuWithBrand = (brandName, skuName, addedBy, files, signal) => {
  const formData = new FormData();
  formData.append("brand_name", brandName);
  formData.append("sku_name", skuName);
  formData.append("added_by", addedBy);
  files.forEach((file) => formData.append("files", file));
  return postFormData(apiRoutes.addSkuWithBrand, formData, { signal });
};

/**
 * Fetch all brands from MongoDB with SKU counts
 * @param {AbortSignal} [signal]
 */
export const fetchBrandsFromMongodb = (signal) => get(apiRoutes.brandsFromMongodb, { signal });

/**
 * Fetch SKUs for a specific brand
 * @param {string} brandName
 * @param {AbortSignal} [signal]
 */
export const fetchSkusByBrand = (brandName, signal) =>
  get(`${apiRoutes.skusByBrand}/${encodeURIComponent(brandName)}`, { signal });

/**
 * Update training status for a SKU
 * @param {string} skuName
 * @param {string} status - "Queued", "Training", "Done", "Failed"
 * @param {AbortSignal} [signal]
 */
export const updateTrainingStatus = (skuName, status, signal) => {
  const formData = new FormData();
  formData.append("status", status);
  return postFormData(`${apiRoutes.updateTrainingStatus}/${encodeURIComponent(skuName)}`, formData, { signal });
};

/**
 * Soft delete a SKU (hide from display)
 * @param {string} skuName
 * @param {AbortSignal} [signal]
 */
export const deleteSku = (skuName, signal) =>
  client.request(`${apiRoutes.deleteSku}/${encodeURIComponent(skuName)}`, { method: "DELETE", signal });

/**
 * Fetch dashboard metrics, trends, and store rollups.
 * @param {{
 *  org_id?: string;
 *  shop_ids?: string[];
 *  date_from?: string;
 *  date_to?: string;
 *  granularity?: string;
 *  compare_to?: string;
 * }} params
 * @param {AbortSignal} [signal]
 */
export const fetchDashboard = (params = {}, signal) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(`${key}[]`, v));
    } else {
      searchParams.append(key, value);
    }
  });
  const path = searchParams.toString() ? `${apiRoutes.dashboard}?${searchParams.toString()}` : apiRoutes.dashboard;
  return get(path, { signal });
};

export default {
  fetchHome,
  searchSimilarImages,
  calculateMetrics,
  addNewProduct,
  analyzeShelfWithPlanogram,
  fetchAnalysisReports,
  fetchShelfAnalysisStatus,
  fetchDebugDatabase,
  fetchProducts,
  fetchImages,
  fetchHealth,
  fetchCroppingGuide,
  addSkuWithBrand,
  fetchBrandsFromMongodb,
  fetchSkusByBrand,
  updateTrainingStatus,
  deleteSku,
  fetchDashboard,
};
