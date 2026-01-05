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

      <div class="event-grid">
        <div class="event-card" v-for="event in lowStockEvents" :key="event.id">
          <div class="event-image"></div>

          <h4>{{ event.title }}</h4>
          <p class="event-location">{{ event.location }}</p>

          <p class="event-date">
            {{ new Date(event.start_date).toLocaleDateString("nl-BE") }}
          </p>

          <p class="ticket-warning">
            Nog {{ event.standard_available }} standard tickets
          </p>

          <RouterLink :to="{ name: 'event-detail', params: { id: event.id } }" class="details-btn">
            Bekijk details
          </RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useEventsStore } from "../stores/events";

const eventsStore = useEventsStore();
const searchQuery = ref("");

onMounted(async () => {
  await eventsStore.fetchEvents();
});

const lowStockEvents = computed(() => {
  return [...eventsStore.events]
    .map(event => {
      const standardTicket = event.tickets?.find(
        t => t.type === "Standard"
      );

      return {
        ...event,
        standard_available: standardTicket
          ? standardTicket.available_quantity
          : 0,
      };
    })
    .sort((a, b) => a.standard_available - b.standard_available)
    .slice(0, 3);
});
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
  max-width: none;
}

.events-section h3 {
  text-align: center;
  margin-bottom: 2rem;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.event-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.event-image {
  width: 100%;
  height: 150px;
  background-color: #eee;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.event-location,
.event-date {
  font-size: 0.9rem;
  color: #666;
}

.details-btn {
  display: block;
  margin-block: 1rem;
  background-color: #00b4d8;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
}

.details-btn:hover {
  background-color: #007bff;
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
