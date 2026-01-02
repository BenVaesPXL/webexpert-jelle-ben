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
          Start op {{ new Date(event.start_date).toLocaleDateString() }} om
          {{
            new Date(event.start_date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          }}

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
          <div
            class="ticket-card"
            v-for="ticket in event.tickets"
            :key="ticket.id"
          >
            <h4>{{ ticket.type }}</h4>
            <p>Prijs: €{{ ticket.price }}</p>
            <div class="quantity">
              <label>Aantal</label>
              <input type="number" v-model.number="quantity" min="1" />
            </div>
            <button @click="reserve(ticket)">Reserveer</button>
          </div>
        </div>
        <p v-if="reserveMessage" class="success">{{ reserveMessage }}</p>
        <p v-if="reserveError" class="error">{{ reserveError }}</p>
      </section>

      <section class="favorites">
        <button
          class="favorite-btn"
          @click="toggleFavorite"
          :disabled="favLoading"
        >
          {{
            isFavorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"
          }}
        </button>
        <p v-if="favMessage" class="success">{{ favMessage }}</p>
        <p v-if="favError" class="error">{{ favError }}</p>
      </section>
    </div>
  </section>
</template>

<script>
import { useEventsStore } from "../stores/events";
import { useAuthStore } from "../stores/auth";

const API_BASE = "https://webexpert-jelle-ben.ddev.site:8443/api";

export default {
  name: "EventDetailView",
  data() {
    return {
      eventsStore: useEventsStore(),
      auth: useAuthStore(),
      event: null,
      loading: true,
      quantity: 1,
      reserveMessage: null,
      reserveError: null,
      favLoading: false,
      favError: null,
      favMessage: null,
      isFavorited: false,
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    this.event = await this.eventsStore.fetchEventById(id);
    this.loading = false;
    if (this.auth.isAuthenticated) {
      this.fetchFavoriteStatus();
    }
  },
  methods: {
    async reserve(ticket) {
      this.reserveMessage = null;
      this.reserveError = null;

      if (!this.auth.isAuthenticated) {
        this.reserveError = "Log in om te reserveren";
        this.$router.push({
          name: "login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/events/${this.event.id}/tickets/${ticket.id}/reserve`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: this.auth.token
                ? `Bearer ${this.auth.token}`
                : undefined,
            },
            body: JSON.stringify({ quantity: this.quantity || 1 }),
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Reservatie mislukt");
        this.reserveMessage = json.message || "Tickets gereserveerd";
        this.event.tickets = this.event.tickets.map((t) =>
          t.id === ticket.id
            ? { ...t, available_quantity: json.data.ticket.available_quantity }
            : t
        );
      } catch (err) {
        this.reserveError = err.message;
      }
    },

    async fetchFavoriteStatus() {
      try {
        const res = await fetch(
          `${API_BASE}/favorites/${this.event.id}/check`,
          {
            headers: {
              Accept: "application/json",
              Authorization: this.auth.token
                ? `Bearer ${this.auth.token}`
                : undefined,
            },
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Kon favoriet niet laden");
        this.isFavorited = Boolean(
          json.data?.is_favorited || json.data?.favorited
        );
      } catch (err) {
        this.isFavorited = false;
      }
    },

    async toggleFavorite() {
      if (!this.auth.isAuthenticated) {
        this.favError = "Log in om favorieten te beheren";
        this.$router.push({
          name: "login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }

      this.favLoading = true;
      this.favMessage = null;
      this.favError = null;

      const method = this.isFavorited ? "DELETE" : "POST";

      try {
        const res = await fetch(`${API_BASE}/favorites/${this.event.id}`, {
          method,
          headers: {
            Accept: "application/json",
            Authorization: this.auth.token
              ? `Bearer ${this.auth.token}`
              : undefined,
          },
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.message || "Favorieten bijwerken mislukt");
        this.isFavorited = !this.isFavorited;
        this.favMessage = json.message;
      } catch (err) {
        this.favError = err.message;
      } finally {
        this.favLoading = false;
      }
    },
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

.quantity {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.quantity input {
  width: 70px;
  padding: 0.35rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.favorites {
  margin-top: 1.5rem;
}

.favorite-btn {
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 8px;
  background-color: #f97316;
  color: #fff;
  cursor: pointer;
}

.success {
  color: #15803d;
}

.error {
  color: #b91c1c;
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
