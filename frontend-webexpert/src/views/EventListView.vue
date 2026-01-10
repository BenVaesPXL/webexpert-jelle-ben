<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h2>Alle evenementen</h2>
        <p>Blader door de volledige lijst en vind wat bij je past.</p>
      </div>
    </section>

    <section class="search-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Zoek op titel, locatie of datum"
        />
        <button @click="onSearch">Zoeken</button>
      </div>
    </section>

    <section class="controls-section">
      <div class="view-toggle">
        <button
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          Lijst
        </button>
        <button
          :class="{ active: viewMode === 'calendar' }"
          @click="viewMode = 'calendar'"
        >
          Kalender
        </button>
      </div>
    </section>

    <section class="events-section">
      <h3>{{ viewMode === "list" ? "Resultaten" : "Evenementen Kalender" }}</h3>

      <div v-if="filteredEvents.length === 0" class="empty-state">
        Geen evenementen gevonden.
      </div>

      <template v-else>
        <!-- List View -->
        <div v-if="viewMode === 'list'">
          <div class="event-grid">
            <EventCard
              v-for="event in paginatedEvents"
              :key="event.id"
              :event="event"
            />
          </div>
          <div class="pagination" v-if="totalPages > 1">
            <button :disabled="page === 1" @click="page = page - 1">
              Vorige
            </button>
            <span>Pagina {{ page }} / {{ totalPages }}</span>
            <button :disabled="page === totalPages" @click="page = page + 1">
              Volgende
            </button>
          </div>
        </div>

        <div v-else class="calendar-wrapper">
          <EventCalendar
            :events="allEventsForCalendar"
            @event-click="goToEventDetail"
          />
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import { useEventsStore } from "../stores/events";
import EventCard from "../components/EventCard.vue";
import EventCalendar from "../components/EventCalendar.vue";

export default {
  name: "EventListView",
  components: {
    EventCard,
    EventCalendar,
  },
  data() {
    return {
      eventsStore: useEventsStore(),
      viewMode: "list",
    };
  },
  computed: {
    searchQuery: {
      get() {
        return this.eventsStore.searchQuery;
      },
      set(val) {
        this.eventsStore.setSearchQuery(val);
      },
    },
    page: {
      get() {
        return this.eventsStore.page;
      },
      set(val) {
        this.eventsStore.setPage(val);
      },
    },
    filteredEvents() {
      return this.eventsStore.filteredEvents;
    },
    sortedEvents() {
      const favFlag = (e) => Boolean(e.is_favorited || e.favorited);
      return [...this.filteredEvents].sort((a, b) => {
        const aFav = favFlag(a);
        const bFav = favFlag(b);
        if (aFav === bFav) return 0;
        return aFav ? -1 : 1;
      });
    },
    totalPages() {
      return (
        Math.ceil(this.sortedEvents.length / this.eventsStore.perPage) || 1
      );
    },
    paginatedEvents() {
      const start = (this.page - 1) * this.eventsStore.perPage;
      return this.sortedEvents.slice(start, start + this.eventsStore.perPage);
    },
    allEventsForCalendar() {
      return this.filteredEvents;
    },
  },
  methods: {
    onSearch() {
      // Search is reactive via v-model, no action needed
    },
    goToEventDetail(event) {
      this.$router.push({ name: "event-detail", params: { id: event.id } });
    },
  },
  mounted() {
    this.eventsStore.fetchEvents();
  },
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.hero {
  width: 100%;
  background: linear-gradient(135deg, #007bff 0%, #b909c6 100%);
  color: white;
  text-align: center;
  padding: 4rem 1rem;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
}

.hero-content h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hero-content p {
  font-size: 1.1rem;
}

.search-section {
  width: 100%;
  background-color: #f9f9f9;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.search-bar {
  width: 90%;
  max-width: 800px;
  display: flex;
  gap: 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.search-bar button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.search-bar button:hover {
  background-color: #0056b3;
}

.controls-section {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.view-toggle {
  display: flex;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.view-toggle button {
  background: white;
  border: none;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  color: #555;
}

.view-toggle button:hover {
  background-color: #f0f0f0;
}

.view-toggle button.active {
  background-color: #007bff;
  color: white;
}

.calendar-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.events-section {
  width: 100%;
  padding: 3rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.events-section h3 {
  text-align: center;
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 2rem 0;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 1024px) {
  .event-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .event-grid {
    grid-template-columns: 1fr;
  }
}

.pagination {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.pagination button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #9bb9dc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .hero-content h2 {
    font-size: 1.8rem;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-bar button {
    width: 100%;
  }
}
</style>
