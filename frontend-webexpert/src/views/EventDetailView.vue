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

    <section class="description">
      <h3>Beschrijving</h3>
      <p>{{ event.description }}</p>
    </section>

    <div class="content-columns">
      <div class="content-left">
        <!-- Tickets -->
        <section class="tickets">
          <h3>Beschikbare tickets</h3>
          <div class="ticket-grid">
            <div class="ticket-card" v-for="ticket in event.tickets" :key="ticket.id">
              <h4>{{ ticket.type }}</h4>
              <p>Prijs: €{{ ticket.price }}</p>
              <p class="sub">Beschikbaar: {{ ticket.quantity }}</p>

              <template v-if="canReserve(ticket)">
                <div class="quantity">
                  <label>Aantal</label>
                  <input type="number" v-model.number="quantities[ticket.id]" min="1" />
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
          <button class="favorite-btn" @click="toggleFavorite" :disabled="favLoading">
            {{
              isFavorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"
            }}
          </button>
          <p v-if="favMessage" class="success">{{ favMessage }}</p>
          <p v-if="favError" class="error">{{ favError }}</p>
        </section>
      </div>

      <div class="content-right" v-if="event.image">
        <div class="hero-image">
          <img :src="imageUrl" :alt="event.title" />
        </div>
      </div>
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
      return `${API_BASE.replace('/api', '')}/storage/${this.event.image}`;
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
          { headers: { Accept: "application/json" }, credentials: "include" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Kon favoriet niet laden");
        this.isFavorited = Boolean(
          json.data?.is_favorited || json.data?.favorited
        );
      } catch {
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
        if (!res.ok) throw new Error(json.message || "Favorieten bijwerken mislukt");
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
  padding-block: 4rem;
  margin-bottom: 2rem;
}

.hero-content h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hero-content p {
  font-size: 1.1rem;
}

.description {
  margin-bottom: 2rem;
  margin-left: 15rem;
}

.description h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.content-columns {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-bottom: 2rem;
  margin-left: 15rem;
}

.content-left {
  flex: 7;
}

.content-right {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8rem;
}

@media (max-width: 767px) {
  .content-columns {
    flex-direction: column;
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .content-right {
    margin: 0 auto;
  }

  .description {
    margin-left: 0;
  }

  .ticket-grid {
    grid-template-columns: 1fr;
  }
}


.content-right .hero-image {
  width: 100%;
  max-width: 300px;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
}

.content-right .hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.content-right .hero-image:hover img {
  transform: scale(1.03);
}

.ticket-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.ticket-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

.ticket-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e40af 0%, #7c3aed 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.ticket-card:hover {
  border-color: #7c3aed;
  transform: translateY(-3px);
}

.ticket-card:hover::before {
  transform: scaleX(1);
}

.ticket-card h4 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #1f2937;
  font-weight: 600;
}

.ticket-card p {
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.ticket-card p.sub {
  font-size: 0.9rem;
  color: #9ca3af;
}

.ticket-card button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #00b4d8;
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ticket-card button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.35);
}

.ticket-card button:active {
  transform: translateY(0);
}

.ticket-card button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.favorites {
  margin-top: 1.5rem;
}

.favorite-btn {
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
}

.favorite-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.5);
}

.favorite-btn:active {
  transform: scale(0.98);
}

.favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .content-columns {
    flex-direction: column;
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .content-right {
    margin: 0 auto;
  }

  .description {
    margin-left: 0;
  }

  .ticket-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .ticket-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
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
