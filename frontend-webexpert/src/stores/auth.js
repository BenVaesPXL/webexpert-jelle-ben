import { defineStore } from "pinia";

const API_BASE = "https://webexpert-jelle-ben.ddev.site:8443/api";

async function apiFetch(path, options = {}, token) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json.message || "Request failed";
    throw new Error(message);
  }
  return json;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("auth_token") || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    setToken(token) {
      this.token = token;
      if (token) localStorage.setItem("auth_token", token);
      else localStorage.removeItem("auth_token");
    },

    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        const json = await apiFetch("/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        this.setToken(json.data.token);
        this.user = json.data.user;
        return json;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async login(payload) {
      this.loading = true;
      this.error = null;
      try {
        const json = await apiFetch("/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        this.setToken(json.data.token);
        this.user = json.data.user;
        return json;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      if (!this.token) return null;
      try {
        const json = await apiFetch("/user", { method: "GET" }, this.token);
        this.user = json.data;
        return this.user;
      } catch (err) {
        this.logout();
        throw err;
      }
    },

    async logout() {
      if (!this.token) {
        this.user = null;
        return;
      }
      try {
        await apiFetch("/logout", { method: "POST" }, this.token);
      } catch (err) {
        // ignore errors on logout
      } finally {
        this.setToken(null);
        this.user = null;
      }
    },
  },
});
