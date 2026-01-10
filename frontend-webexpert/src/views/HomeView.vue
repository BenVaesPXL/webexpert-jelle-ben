<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h2>Ontdek en beheer evenementen</h2>
        <p>Maak, plan en boek tickets voor jouw favoriete evenementen.</p>
      </div>
    </section>

    <section class="events-section">
      <h3>Bijna uitverkocht</h3>

      <div v-if="lowStockEvents.length === 0" class="empty-state">
        Geen evenementen gevonden.
      </div>

      <div class="event-grid" v-else>
        <EventCard v-for="event in lowStockEvents" :key="event.id" :event="event" />
      </div>
    </section>
  </div>
</template>

<script>
import { useEventsStore } from "../stores/events";
import EventCard from "../components/EventCard.vue";

export default {
  name: "HomeView",
  components: {
    EventCard,
  },
  data() {
    return {
      eventsStore: useEventsStore(),
    };
  },
  computed: {
    lowStockEvents() {
      return [...this.eventsStore.events]
        .map(event => {
          const totalAvailable = event.tickets?.reduce((sum, t) => {
            return sum + (t.quantity ?? 0);
          }, 0) ?? 0;

          return {
            ...event,
            total_available: totalAvailable,
          };
        })
        .filter(event => event.total_available > 0)
        .sort((a, b) => a.total_available - b.total_available)
        .slice(0, 3);
    }
  },
  mounted() {
    if (!this.eventsStore.events.length) {
      this.eventsStore.fetchEvents();
    }
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

.events-section {
  width: 100%;
  padding: 3rem 1rem;
}

.events-section h3 {
  text-align: center;
  margin-bottom: 2rem;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 900px) {
  .event-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
