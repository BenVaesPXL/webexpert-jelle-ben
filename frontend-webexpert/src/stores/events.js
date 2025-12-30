import { defineStore } from "pinia";

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [
      {
        id: 1,
        title: "Openlucht concert",
        location: "Centraal Park",
        date: "10/12/2025",
        description:
          "Geniet van een fantastisch openluchtconcert met lokale bands in het prachtige Centraal Park. Een onvergetelijke avond vol muziek en gezelligheid.",
        tickets: [
          { id: 1, type: "Standaard", price: 20 },
          { id: 2, type: "VIP", price: 50 },
        ],
      },
      {
        id: 2,
        title: "Tech Meetup",
        location: "Campus A",
        date: "20/11/2025",
        description:
          "Ontmoet innovators en leer over de nieuwste technologische trends. Ideaal voor developers, entrepreneurs en tech-enthousiastelingen.",
        tickets: [{ id: 3, type: "Standaard", price: 10 }],
      },
      {
        id: 3,
        title: "Kunstexpo",
        location: "Stedelijk Museum",
        date: "05/12/2025",
        description:
          "Ontdek moderne kunst van getalenteerde lokale en internationale kunstenaars. Een inspirerende ervaring voor kunstliefhebbers.",
        tickets: [
          { id: 4, type: "Standaard", price: 15 },
          { id: 5, type: "Student", price: 8 },
        ],
      },
      {
        id: 4,
        title: "Gaming Convention",
        location: "Expo Hall",
        date: "15/01/2026",
        description:
          "De ultieme bestemming voor gamers! Probeer nieuwe games, ontmoet developers en neem deel aan toernooien.",
        tickets: [
          { id: 6, type: "Dagticket", price: 25 },
          { id: 7, type: "Weekend Pass", price: 45 },
        ],
      },
      {
        id: 5,
        title: "Jazz Night",
        location: "The Blue Note",
        date: "22/12/2025",
        description:
          "Een intieme jazzavond met topmusici in een sfeervolle setting. Perfect voor liefhebbers van authentieke jazz.",
        tickets: [
          { id: 8, type: "Standaard", price: 30 },
          { id: 9, type: "VIP met drankje", price: 45 },
        ],
      },
      {
        id: 6,
        title: "Startup Pitch",
        location: "Innovation Hub",
        date: "08/12/2025",
        description:
          "Zie veelbelovende startups hun innovatieve ideeën presenteren aan investeerders en het publiek. Netwerkgelegenheid inbegrepen.",
        tickets: [{ id: 10, type: "Standaard", price: 15 }],
      },
      {
        id: 7,
        title: "Food Festival",
        location: "Market Square",
        date: "14/12/2025",
        description:
          "Proef culinaire hoogstandjes van lokale en internationale chefs. Een feest voor je smaakpapillen!",
        tickets: [
          { id: 11, type: "Toegang", price: 5 },
          { id: 12, type: "Proeverij pakket", price: 35 },
        ],
      },
      {
        id: 8,
        title: "Film Premiere",
        location: "City Cinema",
        date: "03/01/2026",
        description:
          "Wees er als eerste bij tijdens deze exclusieve filmpremière. Meet & greet met de cast en crew na afloop.",
        tickets: [
          { id: 13, type: "Standaard", price: 18 },
          { id: 14, type: "Premium met after-party", price: 50 },
        ],
      },
      {
        id: 9,
        title: "Boekbeurs",
        location: "Bibliotheek",
        date: "19/12/2025",
        description:
          "Ontdek nieuwe titels, ontmoet auteurs en neem deel aan interessante workshops. Een must voor bookworms!",
        tickets: [{ id: 15, type: "Dagticket", price: 8 }],
      },
      {
        id: 10,
        title: "Winterloop",
        location: "Stadspark",
        date: "29/12/2025",
        description:
          "Doe mee aan deze gezellige winterloop door het besneeuwd stadspark. Voor alle niveaus, van beginners tot gevorderden.",
        tickets: [
          { id: 16, type: "5km", price: 12 },
          { id: 17, type: "10km", price: 18 },
        ],
      },
      {
        id: 11,
        title: "Fotografie Workshop",
        location: "Creatief Centrum",
        date: "07/01/2026",
        description:
          "Leer van professionele fotografen en verbeter je vaardigheden. Inclusief praktische oefeningen en feedback.",
        tickets: [
          { id: 18, type: "Basis", price: 40 },
          { id: 19, type: "Gevorderd", price: 60 },
        ],
      },
      {
        id: 12,
        title: "Dance Battle",
        location: "Culturele Hal",
        date: "12/01/2026",
        description:
          "Spectaculaire dansgevechten tussen de beste crews uit de regio. Energie, talent en entertainment gegarandeerd!",
        tickets: [
          { id: 20, type: "Staanplaats", price: 15 },
          { id: 21, type: "Zitplaats", price: 25 },
        ],
      },
    ],
    searchQuery: "",
    page: 1,
    perPage: 9,
  }),

  getters: {
    filteredEvents: (state) => {
      const q = state.searchQuery.trim().toLowerCase();
      if (!q) return state.events;
      return state.events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.date.toLowerCase().includes(q)
      );
    },
    totalPages: (state) => {
      const filtered = state.filteredEvents || state.events;
      return Math.ceil(filtered.length / state.perPage) || 1;
    },
    paginatedEvents: (state) => {
      const filtered = state.filteredEvents || state.events;
      const start = (state.page - 1) * state.perPage;
      return filtered.slice(start, start + state.perPage);
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
      if (newPage >= 1 && newPage <= this.totalPages) this.page = newPage;
    },
    // Async placeholder: currently does nothing (data already in local array).
    // Keep async signature so calling code can await later when API is added.
    async fetchEvents() {
      // TODO (API later):
      // const res = await fetch('/api/events')
      // this.events = await res.json()
      // For now, do not return events to avoid using the Promise directly in templates.
    },
    // CRUD helpers (local only, until API integration)
    addEvent(event) {
      this.events.push({ ...event, id: event.id ?? Date.now() });
    },
    updateEvent(id, patch) {
      const idx = this.events.findIndex((e) => e.id === id);
      if (idx !== -1) this.events[idx] = { ...this.events[idx], ...patch };
    },
    removeEvent(id) {
      this.events = this.events.filter((e) => e.id !== id);
    },
  },
});
