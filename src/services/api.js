export const API_BASE_URL = "https://route-posts.routemisr.com";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    const error = new Error(
      data?.message || `Request failed (${response.status})`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}