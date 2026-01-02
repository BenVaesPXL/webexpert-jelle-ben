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

    async fetchEvents() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch events");

        const json = await res.json();

        this.events = json.data.map((e) => ({
          ...e,
          date: e.start_date,
          tickets: e.tickets || [],
        }));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },

    async fetchEventById(id) {
      try {
        const res = await fetch(`${API_URL}/${id}`);
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
  },
});
