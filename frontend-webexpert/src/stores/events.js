import { defineStore } from "pinia";

const API_URL = "http://127.0.0.1:8000/api/events";

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
        const res = await fetch("https://webexpert-jelle-ben.ddev.site/api/events");

        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }

        const json = await res.json();

        this.events = json.data.map(e => ({
          ...e,
          date: e.start_date,
        }));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },



    async fetchEventById(id) {
      try {
        const res = await fetch(`https://webexpert-jelle-ben.ddev.site/api/events/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch event");
        }

        const json = await res.json();

        const event = json.data.event; // haal event object eruit

        return {
          ...event,
          date: event.start_date, // mapping voor frontend
          tickets: event.tickets || [], // voorlopig leeg array
          tickets_can_be_bought: json.data.tickets_can_be_bought
        };
      } catch (error) {
        console.error("Error fetching event:", error);
        return null;
      }
    },
  },
});
