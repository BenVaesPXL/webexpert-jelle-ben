<template>
  <header class="navbar">
    <div class="navbar-inner">
      <h1 class="logo">EventSpot</h1>
      <nav class="nav-links">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/events">Events</RouterLink>
        <template v-if="!auth.isAuthenticated">
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/register">Registreer</RouterLink>
        </template>
        <template v-else>
          <RouterLink v-if="auth.isAdmin" to="/admin/events">Admin</RouterLink>
          <RouterLink to="/profile">Profiel</RouterLink>
          <button class="logout" @click="logout">Logout</button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from "../../stores/auth";

export default {
  name: "Navbar",
  data() {
    return {
      auth: useAuthStore(),
    };
  },
  methods: {
    async logout() {
      await this.auth.logout();
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
.navbar {
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.nav-links {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
}

.logout {
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  cursor: pointer;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #007bff;
}

/* Desktop layout */
@media (min-width: 768px) {
  .navbar-inner {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .nav-links {
    flex-direction: row;
    width: auto;
    gap: 1.5rem;
  }
}
</style>
