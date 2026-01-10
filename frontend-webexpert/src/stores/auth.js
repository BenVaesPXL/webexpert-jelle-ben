import { defineStore } from "pinia";

const API_BASE = import.meta.env.VITE_API_BASE;

let csrfToken = null;

async function fetchCsrf() {
  const res = await fetch(`${API_BASE}/csrf`, { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  csrfToken = json.csrf_token || null;
  return csrfToken;
}

async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(method);

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (needsCsrf) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    const token = await fetchCsrf();
    if (token) headers["X-CSRF-TOKEN"] = token;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
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
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        const json = await apiFetch("/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        this.user = json.data.user;
        csrfToken = null;
        await fetchCsrf();
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
        this.user = json.data.user;
        csrfToken = null;
        await fetchCsrf();
        return json;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      try {
        const json = await apiFetch("/user", { method: "GET" });
        this.user = json.data || null;
        return this.user;
      } catch (err) {
        this.user = null;
        return null;
      }
    },

    async logout() {
      try {
        await apiFetch("/logout", { method: "POST" });
      } catch {
        // Logout errors intentionally ignored
      } finally {
        this.user = null;
        csrfToken = null;
      }
    },

    async ensureCsrf() {
      if (csrfToken) return csrfToken;
      return fetchCsrf();
    },
  },
});
