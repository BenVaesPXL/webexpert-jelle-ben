<template>
  <div class="profile">
    <section class="hero">
      <h2>Hallo {{ auth.user?.name }}</h2>
      <p>{{ auth.user?.email }}</p>
    </section>

    <section class="panel">
      <header>
        <h3>Bookings</h3>
        <span v-if="loading">Laden...</span>
      </header>
      <p v-if="error" class="error">{{ error }}</p>
      <div v-if="!loading && bookings.length === 0" class="empty">
        Geen boekingen gevonden.
      </div>
      <div class="list" v-else>
        <article v-for="booking in bookings" :key="booking.id" class="item">
          <div>
            <h4>{{ booking.event?.title }}</h4>
            <p>
              {{ booking.quantity }}x {{ booking.ticket?.type }} - €{{
                booking.price_paid
              }}
            </p>
            <small>Status: {{ booking.status }}</small>
          </div>
          <div>
            <p>
              {{ formatDate(booking.event?.start_date) }} -
              {{ booking.event?.location }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <header>
        <h3>Favorieten</h3>
        <span v-if="favLoading">Laden...</span>
      </header>
      <p v-if="favError" class="error">{{ favError }}</p>
      <div v-if="!favLoading && favorites.length === 0" class="empty">
        Geen favorieten gevonden.
      </div>
      <div class="list" v-else>
        <article v-for="fav in favorites" :key="fav.id" class="item">
          <div>
            <h4>{{ fav.title }}</h4>
            <p>{{ fav.location }}</p>
          </div>
          <div>
            <p>{{ formatDate(fav.start_date) }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import { useAuthStore } from "../stores/auth";

const API_BASE = "https://webexpert-jelle-ben.ddev.site:8443/api";

export default {
  name: "ProfileView",
  data() {
    return {
      auth: useAuthStore(),
      bookings: [],
      favorites: [],
      loading: false,
      favLoading: false,
      error: null,
      favError: null,
    };
  },
  methods: {
    async authFetch(path) {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: {
          Accept: "application/json",
          Authorization: this.auth.token
            ? `Bearer ${this.auth.token}`
            : undefined,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Request failed");
      return json;
    },

    async loadBookings() {
      this.loading = true;
      this.error = null;
      try {
        const json = await this.authFetch("/bookings");
        this.bookings = json.data || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async loadFavorites() {
      this.favLoading = true;
      this.favError = null;
      try {
        const json = await this.authFetch("/favorites");
        this.favorites = json.data || [];
      } catch (err) {
        this.favError = err.message;
      } finally {
        this.favLoading = false;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleString();
    },
  },
  mounted() {
    this.loadBookings();
    this.loadFavorites();
  },
};
</script>

<style scoped>
.profile {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero {
  background: linear-gradient(135deg, #007bff 0%, #b909c6 100%);
  color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  border-radius: 10px;
}

.error {
  color: #d14343;
}

.empty {
  color: #6b7280;
}
</style>
