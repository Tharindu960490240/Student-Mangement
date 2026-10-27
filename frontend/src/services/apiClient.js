// ===============================
// Shared request helper for signed-in API calls.
// Adds the saved token. If the server says the session is no longer valid
// (401), the saved login is cleared and the user is sent to sign in.
//
// Always resolves to { success, message?, data?, pagination?, errors?, status }.
// ===============================
export const apiRequest = async (url, { method = "GET", body } = {}) => {
  const token = localStorage.getItem("Token");

  try {
    // A FormData body (file uploads) is sent as is; the browser sets its content type.
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    const res = await fetch(url, {
      method,
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    const json = await res.json().catch(() => ({}));

    if (res.status === 401 && token) {
      localStorage.removeItem("Token");
      localStorage.removeItem("sessionTimestamp");
      window.location.assign("/signin");
    }

    return {
      ...json,
      success: res.ok && json.success !== false,
      status: res.status,
    };
  } catch (error) {
    return { success: false, message: "Could not reach the server." };
  }
};

export const toQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") q.set(key, value);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
};

// Downloads a protected file. The browser cannot send the sign-in token with a
// normal link, so the file is fetched with it and then saved from memory.
export const apiDownload = async (url, fileName = "download") => {
  const token = localStorage.getItem("Token");
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401 && token) {
      localStorage.removeItem("Token");
      localStorage.removeItem("sessionTimestamp");
      window.location.assign("/signin");
      return { success: false };
    }
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, message: json.message || "Could not download the file." };
    }

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Could not reach the server." };
  }
};
