import { defineStore } from "pinia";
import { useAuthStore } from "./auth";

const API_URL = `${import.meta.env.VITE_API_BASE}/events`;

async function csrfHeaders(extra = {}) {
  const auth = useAuthStore();
  const token = await auth.ensureCsrf();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { "X-CSRF-TOKEN": token } : {}),
    ...extra,
  };
}

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [],
    currentEvent: null,
    searchQuery: "",
    page: 1,
    perPage: 9,
    loading: false,
    error: null,
  }),

  getters: {
    filteredEvents(state) {
      const q = state.searchQuery.trim().toLowerCase();
      if (!q) return state.events;

      return state.events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.start_date && e.start_date.toLowerCase().includes(q))
      );
    },

    totalPages(state) {
      return Math.ceil(this.filteredEvents.length / state.perPage) || 1;
    },

    paginatedEvents(state) {
      const start = (state.page - 1) * state.perPage;
      return this.filteredEvents.slice(start, start + state.perPage);
    },

    getEventById: (state) => (id) => {
      return state.events.find((e) => e.id == id);
    },
  },

  actions: {
    setSearchQuery(q) {
      this.searchQuery = q;
      this.page = 1;
    },

    setPage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.page = newPage;
      }
    },

    async fetchEvents({ includeDrafts = false } = {}) {
      const headers = { Accept: "application/json" };
      const url = includeDrafts ? `${API_URL}?include_drafts=1` : API_URL;

      try {
        const res = await fetch(url, { headers, credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch events");

        const json = await res.json();
        const existingById = this.events.reduce((m, ev) => {
          m[ev.id] = ev;
          return m;
        }, {});

        this.events = json.data.map((e) => {
          const existing = existingById[e.id] || {};
          const isFav = Boolean(
            existing.is_favorited || existing.favorited || e.is_favorited || e.favorited
          );

          return {
            ...e,
            date: e.start_date,
            tickets: e.tickets || [],
            is_favorited: isFav,
            favorited: isFav,
          };
        });

        try {
          const auth = useAuthStore();
          if (auth.isAuthenticated) {
            const favRes = await fetch(`${import.meta.env.VITE_API_BASE}/favorites`, {
              headers: { Accept: "application/json" },
              credentials: "include",
            });
            if (favRes.ok) {
              const favJson = await favRes.json().catch(() => ({}));
              const favIds = new Set((favJson.data || []).map((f) => f.id));
              this.events = this.events.map((ev) => ({
                ...ev,
                is_favorited: favIds.has(ev.id) || ev.is_favorited,
                favorited: favIds.has(ev.id) || ev.favorited,
              }));
            }
          }
        } catch {
          // Favorites fetch failed silently - non-critical
        }
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching events:", error);
        throw error;
      }
    },

    async fetchEventById(id) {
      const headers = { Accept: "application/json" };

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          headers,
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch event");
        }

        const json = await res.json();

        const event = json.data.event;
        const existing = this.events.find((ev) => ev.id == event.id) || {};
        const isFav = Boolean(
          existing.is_favorited || existing.favorited || event.is_favorited || event.favorited
        );

        return {
          ...event,
          date: event.start_date,
          tickets: event.tickets || [],
          tickets_can_be_bought: json.data.tickets_can_be_bought,
          is_favorited: isFav,
          favorited: isFav,
        };
      } catch (error) {
        console.error("Error fetching event:", error);
        return null;
      }
    },

    async createEvent(payload) {
      const headers = await csrfHeaders();

      const res = await fetch(API_URL, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to create event");
      }

      const newEvent = {
        ...json.data,
        date: json.data.start_date,
        tickets: json.data.tickets || [],
      };
      this.events = [newEvent, ...this.events];
      return newEvent;
    },

    async createEventWithFile(formData) {
      const auth = useAuthStore();
      const token = await auth.ensureCsrf();
      const headers = {
        Accept: "application/json",
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to create event");
      }

      const newEvent = {
        ...json.data,
        date: json.data.start_date,
        tickets: json.data.tickets || [],
      };
      this.events = [newEvent, ...this.events];
      return newEvent;
    },

    async updateEvent(id, payload) {
      const headers = await csrfHeaders();

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to update event");
      }

      const updated = {
        ...json.data,
        date: json.data.start_date,
        tickets: json.data.tickets || [],
      };

      this.events = this.events.map((e) => (e.id === updated.id ? updated : e));
      if (this.currentEvent?.id === updated.id) {
        this.currentEvent = updated;
      }

      return updated;
    },

    async updateEventWithFile(id, formData) {
      const auth = useAuthStore();
      const token = await auth.ensureCsrf();
      formData.append("_method", "PUT");
      const headers = {
        Accept: "application/json",
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
      };

      const res = await fetch(`${API_URL}/${id}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          json.message ||
          JSON.stringify(json.errors) ||
          "Failed to update event"
        );
      }

      const updated = {
        ...json.data,
        date: json.data.start_date,
        tickets: json.data.tickets || [],
      };

      this.events = this.events.map((e) => (e.id === updated.id ? updated : e));
      if (this.currentEvent?.id === updated.id) {
        this.currentEvent = updated;
      }

      return updated;
    },

    async createTicket(eventId, payload) {
      const headers = await csrfHeaders();

      const res = await fetch(`${API_URL}/${eventId}/tickets`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to create ticket");
      }

      const ticket = json.data;

      // update local state
      this.events = this.events.map((ev) =>
        ev.id === Number(eventId)
          ? { ...ev, tickets: [...(ev.tickets || []), ticket] }
          : ev
      );

      if (this.currentEvent?.id == eventId) {
        this.currentEvent = {
          ...this.currentEvent,
          tickets: [...(this.currentEvent.tickets || []), ticket],
        };
      }

      return ticket;
    },

    async updateTicket(eventId, ticketId, payload) {
      const headers = await csrfHeaders();

      const res = await fetch(`${API_URL}/${eventId}/tickets/${ticketId}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to update ticket");
      }

      const ticket = json.data;

      // update local state
      this.events = this.events.map((ev) =>
        ev.id === Number(eventId)
          ? {
            ...ev,
            tickets: (ev.tickets || []).map((t) =>
              t.id === ticketId ? { ...t, ...ticket } : t
            ),
          }
          : ev
      );

      if (this.currentEvent?.id == eventId) {
        this.currentEvent = {
          ...this.currentEvent,
          tickets: (this.currentEvent.tickets || []).map((t) =>
            t.id === ticketId ? { ...t, ...ticket } : t
          ),
        };
      }

      return ticket;
    },

    async deleteTicket(eventId, ticketId) {
      const headers = await csrfHeaders({ "Content-Type": "application/json" });

      const res = await fetch(`${API_URL}/${eventId}/tickets/${ticketId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete ticket");
      }

      this.events = this.events.map((ev) =>
        ev.id === Number(eventId)
          ? {
            ...ev,
            tickets: (ev.tickets || []).filter((t) => t.id !== ticketId),
          }
          : ev
      );

      if (this.currentEvent?.id == eventId) {
        this.currentEvent = {
          ...this.currentEvent,
          tickets: (this.currentEvent.tickets || []).filter(
            (t) => t.id !== ticketId
          ),
        };
      }
    },

    async deleteEvent(id) {
      const headers = await csrfHeaders({ "Content-Type": "application/json" });

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete event");
      }

      this.events = this.events.filter((e) => e.id !== id);
      if (this.currentEvent?.id === id) {
        this.currentEvent = null;
      }
    },

    // Mark an event as favorited/unfavorited in local store
    setFavorite(eventId, isFavorited) {
      this.events = this.events.map((e) =>
        e.id === Number(eventId)
          ? { ...e, is_favorited: isFavorited, favorited: isFavorited }
          : e
      );

      if (this.currentEvent?.id === Number(eventId)) {
        this.currentEvent = {
          ...this.currentEvent,
          is_favorited: isFavorited,
          favorited: isFavorited,
        };
      }
    },
  },
});
