export const getApiErrorMessage = (err, fallback = "Request failed") => {
  if (!err) return fallback;
  const data = err.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (Array.isArray(data?.errors)) return data.errors.join(", ");
  if (err.response?.status === 413) {
    return "Payload too large — try a smaller file or fewer fields.";
  }
  if (err.message === "Network Error") {
    return "Cannot reach server. Start the backend (port 5000) and check VITE_API_URL.";
  }
  if (err.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }
  return err.message || fallback;
};
