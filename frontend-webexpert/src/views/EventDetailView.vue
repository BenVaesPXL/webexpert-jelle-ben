<template>
  <section v-if="loading">
    <p>Evenement laden...</p>
  </section>

  <section v-else-if="!event">
    <p>Evenement niet gevonden.</p>
  </section>

  <section v-else>
    <section class="hero">
      <div v-if="event.image" class="hero-image">
        <img :src="imageUrl" :alt="event.title" class="image" />
      </div>
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
            <p class="sub">Beschikbaar: {{ ticket.quantity }}</p>
            <template v-if="canReserve(ticket)">
              <div class="quantity">
                <label>Aantal</label>
                <input
                  type="number"
                  v-model.number="quantities[ticket.id]"
                  :min="1"
                  :max="ticket.quantity"
                  @input="handleQuantityInput(ticket)"
                />
              </div>
              <button @click="reserve(ticket)">Reserveer</button>
            </template>
            <p v-if="ticketStatus(ticket)" class="sub status">
              {{ ticketStatus(ticket) }}
            </p>
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

const API_BASE = import.meta.env.VITE_API_BASE;

export default {
  name: "EventDetailView",
  data() {
    return {
      eventsStore: useEventsStore(),
      auth: useAuthStore(),
      event: null,
      loading: true,
      quantities: {},
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
    this.seedQuantities();
    this.loading = false;
    if (this.auth.isAuthenticated) {
      this.fetchFavoriteStatus();
    }
  },
  computed: {
    imageUrl() {
      if (!this.event?.image) return null;
      return `${API_BASE.replace("/api", "")}/storage/${this.event.image}`;
    },
  },
  methods: {
    seedQuantities() {
      if (!this.event?.tickets) return;
      const defaults = {};
      this.event.tickets.forEach((t) => {
        defaults[t.id] = this.quantities[t.id] || 1;
      });
      this.quantities = defaults;
    },

    async csrfHeaders(extra = {}) {
      const token = await this.auth.ensureCsrf();
      return {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
        ...extra,
      };
    },

    canReserve(ticket) {
      if (!ticket) return false;
      if (ticket.quantity <= 0) return false;

      const now = new Date();
      const startsAt = ticket.sale_starts_at
        ? new Date(ticket.sale_starts_at)
        : null;
      const endsAt = ticket.sale_ends_at ? new Date(ticket.sale_ends_at) : null;

      // Require a start date and only allow on/after it
      if (!startsAt || Number.isNaN(startsAt) || startsAt > now) return false;
      if (endsAt && !Number.isNaN(endsAt) && endsAt < now) return false;

      return true;
    },

    ticketStatus(ticket) {
      if (!ticket) return "";
      if (ticket.quantity <= 0) return "Uitverkocht";

      const now = new Date();
      const startsAt = ticket.sale_starts_at
        ? new Date(ticket.sale_starts_at)
        : null;
      const endsAt = ticket.sale_ends_at ? new Date(ticket.sale_ends_at) : null;

      if (!startsAt || Number.isNaN(startsAt) || startsAt > now) {
        return startsAt && !Number.isNaN(startsAt)
          ? `Verkoop start op ${startsAt.toLocaleString()}`
          : "Verkoop nog niet gestart";
      }

      if (endsAt && !Number.isNaN(endsAt) && endsAt < now) {
        return "Verkoop afgelopen";
      }

      return "";
    },

    handleQuantityInput(ticket) {
      const val = this.quantities[ticket.id];
      if (val > ticket.quantity) {
        this.quantities[ticket.id] = ticket.quantity;
      } else if (val < 1) {
        this.quantities[ticket.id] = 1;
      }
    },

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

      const qty = this.quantities[ticket.id] || 1;
      if (qty < 1) {
        this.reserveError = "Aantal moet minstens 1 zijn";
        return;
      }

      try {
        const headers = await this.csrfHeaders();
        const res = await fetch(
          `${API_BASE}/events/${this.event.id}/tickets/${ticket.id}/reserve`,
          {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({ quantity: qty }),
          }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Reservatie mislukt");
        this.reserveMessage = json.message || "Tickets gereserveerd";
        this.event.tickets = this.event.tickets.map((t) =>
          t.id === ticket.id ? { ...t, quantity: json.data.ticket.quantity } : t
        );
        this.quantities = { ...this.quantities, [ticket.id]: 1 };
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
            },
            credentials: "include",
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
        const headers = await this.csrfHeaders({ Accept: "application/json" });
        const res = await fetch(`${API_BASE}/favorites/${this.event.id}`, {
          method,
          headers,
          credentials: "include",
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
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.hero-image {
  width: 100%;
  max-width: 600px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hero-image .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.status {
  margin-top: 0.25rem;
  color: #5c6f82;
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
