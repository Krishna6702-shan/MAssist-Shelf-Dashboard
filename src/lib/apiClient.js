import apiConfig from "../config/apiConfig";

const parseJSON = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  if (contentType.includes("text/")) {
    return response.text();
  }
  return response;
};

const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiConfig.baseUrl}${normalizedPath}`;
};

const request = async (path, { method = "GET", headers = {}, body, signal } = {}) => {
  const finalHeaders = new Headers(apiConfig.defaultHeaders);
  // Inject bearer token if present
  try {
    const token = localStorage.getItem("access_token");
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  } catch {
    // ignore if localStorage unavailable
  }
  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      finalHeaders.set(key, value);
    }
  });

  const response = await fetch(buildUrl(path), {
    method,
    headers: body instanceof FormData ? undefined : finalHeaders,
    body,
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    const errorPayload = await parseJSON(response).catch(() => ({}));
    const error = new Error(response.statusText || "Request failed");
    error.status = response.status;
    error.payload = errorPayload;
    throw error;
  }

  return parseJSON(response);
};

export const get = (path, options) => request(path, { ...options, method: "GET" });

export const postJSON = (path, data, options) =>
  request(path, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(data),
  });

export const postFormData = (path, formData, options) =>
  request(path, {
    ...options,
    method: "POST",
    body: formData,
  });

export default {
  request,
  get,
  postJSON,
  postFormData,
};
