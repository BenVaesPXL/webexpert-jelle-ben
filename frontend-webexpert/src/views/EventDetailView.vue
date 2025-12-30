<template>
  <section v-if="loading">
    <p>Evenement laden...</p>
  </section>

  <section v-else-if="!event">
    <p>Evenement niet gevonden.</p>
  </section>

  <section v-else>
    <section class="hero">
      <div class="hero-content">
        <h2>{{ event.title }}</h2>
        <p>
          Start op {{ new Date(event.start_date).toLocaleDateString() }} om {{ new
            Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'}) }}

          in {{ event.location }}
        </p>
      </div>
    </section>

    <div class="content">
      <section class="description">
        <h3>Beschrijving</h3>
        <p>{{ event.description }}</p>
      </section>

      <section class="tickets">
        <h3>Beschikbare tickets</h3>
        <div class="ticket-grid">
          <div class="ticket-card" v-for="ticket in event.tickets" :key="ticket.id">
            <h4>{{ ticket.type }}</h4>
            <p>Prijs: €{{ ticket.price }}</p>
            <button>Reserveer</button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script>
import { useEventsStore } from "../stores/events";

export default {
  name: "EventDetailView",
  data() {
    return {
      eventsStore: useEventsStore(),
      event: null,
      loading: true,
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    this.event = await this.eventsStore.fetchEventById(id);
    this.loading = false;
  },
};

</script>

<style scoped>
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

.content {
  margin-left: 1rem;
}

.tickets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.ticket-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  background-color: #fff;
}

.ticket-card button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #00b4d8;
  color: white;
  cursor: pointer;
}

.ticket-card button:hover {
  background-color: #007bff;
}

/* Tablet & Desktop */
@media (min-width: 600px) {
  .ticket-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .hero-content h2 {
    font-size: 2.5rem;
  }

  .ticket-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1440px) {
  .ticket-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
