import { defineStore } from "pinia";

const API_URL = "https://webexpert-jelle-ben.ddev.site:8443/api/events";

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

    async fetchEvents(token) {
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        const res = await fetch(API_URL, { headers });
        if (!res.ok) throw new Error("Failed to fetch events");

        const json = await res.json();

        this.events = json.data.map((e) => ({
          ...e,
          date: e.start_date,
          tickets: e.tickets || [],
        }));
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching events:", error);
        throw error;
      }
    },

    async fetchEventById(id, token) {
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        const res = await fetch(`${API_URL}/${id}`, { headers });
        if (!res.ok) {
          throw new Error("Failed to fetch event");
        }

        const json = await res.json();

        const event = json.data.event;

        return {
          ...event,
          date: event.start_date,
          tickets: event.tickets || [],
          tickets_can_be_bought: json.data.tickets_can_be_bought,
        };
      } catch (error) {
        console.error("Error fetching event:", error);
        return null;
      }
    },

    async createEvent(payload, token) {
      if (!token) throw new Error("Authentication required");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

    async updateEvent(id, payload, token) {
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

    async createTicket(eventId, payload, token) {
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_URL}/${eventId}/tickets`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

    async updateTicket(eventId, ticketId, payload, token) {
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_URL}/${eventId}/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

    async deleteTicket(eventId, ticketId, token) {
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_URL}/${eventId}/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
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

    async deleteEvent(id, token) {
      if (!token) throw new Error("Authentication required");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
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
  },
});
