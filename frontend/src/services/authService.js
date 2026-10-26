import { API_ENDPOINTS } from "../const/const";
const { jwtDecode } = require("jwt-decode");

/* ===========================
    REGISTER USER
=========================== */
export const registerUser = async (userData) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    LOGIN USER
=========================== */
export const loginUser = async (credentials) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    VERIFY EMAIL
=========================== */
export const verifyEmail = async (token) => {
  try {
    const res = await fetch(`${API_ENDPOINTS.AUTH.VERIFY}/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Verification failed");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    GET PROFILE (ME)
=========================== */
export const getProfile = async (token) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.ME, {
      method: "GET",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch profile");
    }

    return { success: true, user: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
    UPDATE PROFILE
=========================== */
export const updateProfile = async (token, userData) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: "PUT",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Profile update failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
    UPDATE PROFILE IMAGE
=========================== */
export const updateProfileImage = async (token, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await fetch(API_ENDPOINTS.AUTH.ME_IMAGE, {
      method: "PUT",
      headers: {
        
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Image upload failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
    CHANGE PASSWORD
=========================== */
export const changePassword = async (token, passwordData) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: "PUT",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Password change failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
    RESEND VERIFICATION
=========================== */
export const resendVerification = async (email) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.RESEND, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Resend failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* ===========================
    ADMIN - UPDATE USER STATUS
=========================== */
export const updateUserStatus = async (token, userId, email, status) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.UPDATE_STATUS(userId), {
      method: "PATCH",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, status }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Status update failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export async function get_token() {
  try {
    const userToken = await localStorage.getItem("Token");
    return userToken;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
}

export const sendPasswordResetLink = async (email) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send reset link");
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Password reset failed");
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllUsers = async (token, params = {}) => {
  try {
    const query = new URLSearchParams();

    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.role) query.append("role", params.role);

    const res = await fetch(`${API_ENDPOINTS.AUTH.BASE}?${query.toString()}`, {
      method: "GET",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch users");
    }

    return {
      success: true,
      data: data.data,
      total: data.total,
      page: data.page,
      limit: data.limit,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export async function getMyData() {
  try {
    const userToken = await localStorage.getItem("Token");
    if (userToken) {
      const user = jwtDecode(userToken);
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error fetching email:", error);
    return null;
  }
}

export const deleteProfile = async (token) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.DELETE_PROFILE, {
      method: "DELETE",
      headers: {
        
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Account deletion failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
