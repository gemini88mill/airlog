const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TOKEN_KEY = "airlog_access_token";

export const auth = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ user: unknown; session: unknown }> => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Login failed" }));
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();

    if (data.session?.access_token) {
      auth.setToken(data.session.access_token);
    }

    return data;
  },

  logout: async (): Promise<void> => {
    const token = auth.getToken();

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/v1/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Even if logout fails, clear local token
        console.error("Logout error:", error);
      }
    }

    auth.removeToken();
  },

  getSession: async (): Promise<{
    user: unknown | null;
    session: unknown | null;
  }> => {
    const token = auth.getToken();

    if (!token) {
      return { user: null, session: null };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/session`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        auth.removeToken();
        return { user: null, session: null };
      }

      const data = await response.json();

      if (!data.user) {
        auth.removeToken();
        return { user: null, session: null };
      }

      return data;
    } catch (error) {
      console.error("Session error:", error);
      auth.removeToken();
      return { user: null, session: null };
    }
  },
};
