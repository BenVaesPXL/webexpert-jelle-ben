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
          <div class="item-info">
            <h4>{{ booking.event?.title }}</h4>
            <p>
              {{ booking.quantity }}x {{ booking.ticket?.type }} - €{{
                booking.price_paid
              }}
            </p>
            <small :class="{ 'status-cancelled': booking.status === 'cancelled' }">Status: {{ booking.status }}</small>
          </div>
          <div class="item-details">
            <p>
              {{ formatDate(booking.event?.start_date) }} -
              {{ booking.event?.location }}
            </p>
          </div>
          <div class="item-actions">
            <button
              v-if="booking.status !== 'cancelled'"
              class="btn cancel"
              :disabled="cancellingId === booking.id"
              @click="cancelBooking(booking.id)"
            >
              {{ cancellingId === booking.id ? 'Annuleren...' : 'Annuleer' }}
            </button>
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

    <section class="panel">
      <header>
        <h3>Wachtwoord wijzigen</h3>
      </header>
      <form @submit.prevent="changePassword" class="password-form">
        <label>
          Huidig wachtwoord
          <input
            type="password"
            v-model="passwordForm.current_password"
            required
          />
        </label>
        <label>
          Nieuw wachtwoord
          <input
            type="password"
            v-model="passwordForm.password"
            required
            minlength="8"
          />
        </label>
        <label>
          Bevestig nieuw wachtwoord
          <input
            type="password"
            v-model="passwordForm.password_confirmation"
            required
            minlength="8"
          />
        </label>
        <p v-if="passwordError" class="error">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="success">{{ passwordSuccess }}</p>
        <button type="submit" class="btn primary" :disabled="passwordLoading">
          {{ passwordLoading ? "Bezig..." : "Wijzig wachtwoord" }}
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import { useAuthStore } from "../stores/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

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
      cancellingId: null,
      passwordForm: {
        current_password: "",
        password: "",
        password_confirmation: "",
      },
      passwordLoading: false,
      passwordError: null,
      passwordSuccess: null,
    };
  },
  methods: {
    async authFetch(path) {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
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

    async cancelBooking(bookingId) {
      if (!confirm('Weet je zeker dat je deze boeking wilt annuleren?')) {
        return;
      }

      this.cancellingId = bookingId;
      try {
        const token = await this.auth.ensureCsrf();
        const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'X-CSRF-TOKEN': token } : {}),
          },
          credentials: 'include',
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Annuleren mislukt');
        }

        
        await this.loadBookings();
      } catch (err) {
        alert(err.message);
      } finally {
        this.cancellingId = null;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleString();
    },

    async changePassword() {
      this.passwordLoading = true;
      this.passwordError = null;
      this.passwordSuccess = null;

      try {
        const token = await this.auth.ensureCsrf();
        const res = await fetch(`${API_BASE}/user/password`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { "X-CSRF-TOKEN": token } : {}),
          },
          credentials: "include",
          body: JSON.stringify(this.passwordForm),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Wachtwoord wijzigen mislukt");
        }

        this.passwordSuccess = json.message || "Wachtwoord succesvol gewijzigd";
        this.passwordForm = {
          current_password: "",
          password: "",
          password_confirmation: "",
        };
      } catch (err) {
        this.passwordError = err.message;
      } finally {
        this.passwordLoading = false;
      }
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
  align-items: stretch;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  border-radius: 10px;
}

.item-info {
  flex: 1;
}

.item-details {
  flex-shrink: 0;
}

.item-actions {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  align-self: flex-end;
}

.error {
  color: #d14343;
}

.empty {
  color: #6b7280;
}

.success {
  color: #15803d;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.password-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  color: #2b3f55;
}

.password-form input {
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #cfd8e3;
  font-size: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: 1px solid #0b5ac2;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}

.btn.primary {
  background: linear-gradient(120deg, #0b5ac2, #3f8bff);
  color: #fff;
  box-shadow: 0 8px 24px rgba(11, 90, 194, 0.25);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.cancel {
  background: linear-gradient(120deg, #dc2626, #ef4444);
  color: #fff;
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.btn.cancel:hover:not(:disabled) {
  background: linear-gradient(120deg, #b91c1c, #dc2626);
}

.status-cancelled {
  color: #9ca3af;
  text-decoration: line-through;
}

</style>
