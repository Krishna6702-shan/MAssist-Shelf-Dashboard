const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const apiConfig = {
  baseUrl,
  defaultHeaders: {
    Accept: "application/json",
  },
};

export default apiConfig;
