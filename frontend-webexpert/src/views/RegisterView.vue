<template>
  <div class="auth-page">
    <div class="card">
      <h2>Registreer</h2>
      <form @submit.prevent="onSubmit">
        <label>Naam</label>
        <input v-model="form.name" type="text" required />

        <label>Email</label>
        <input v-model="form.email" type="email" required />

        <label>Wachtwoord</label>
        <input v-model="form.password" type="password" required />

        <label>Bevestig wachtwoord</label>
        <input v-model="form.password_confirmation" type="password" required />

        <button :disabled="auth.loading">Account aanmaken</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="switch">
        Al een account? <RouterLink to="/login">Log in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "../stores/auth";
import { RouterLink } from "vue-router";

export default {
  name: "RegisterView",
  components: { RouterLink },
  data() {
    return {
      auth: useAuthStore(),
      form: {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      },
      error: null,
    };
  },
  methods: {
    async onSubmit() {
      this.error = null;
      try {
        await this.auth.register(this.form);
        this.$router.push("/profile");
      } catch (err) {
        this.error = err.message || "Registratie mislukt";
      }
    },
  },
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

h2 {
  margin-bottom: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

label {
  font-weight: 600;
  font-size: 0.95rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

button {
  margin-top: 0.5rem;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #007bff 0%, #b909c6 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #d14343;
  margin-top: 0.5rem;
}

.switch {
  margin-top: 1rem;
  text-align: center;
}
</style>
