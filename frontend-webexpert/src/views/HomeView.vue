<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h2>Ontdek en beheer evenementen</h2>
        <p>Maak, plan en boek tickets voor jouw favoriete evenementen.</p>
      </div>
    </section>

    <section class="search-section">
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="Zoek op titel, locatie of datum" />
        <button @click="searchEvents">Zoeken</button>
      </div>
    </section>

    <section class="events-section">
      <h3>Populaire evenementen</h3>
      <div class="event-grid">
        <div class="event-card" v-for="event in mockEvents" :key="event.id">
          <div class="event-image"></div>
          <h4>{{ event.title }}</h4>
          <p class="event-location">{{ event.location }}</p>
          <p class="event-date">{{ event.date }}</p>
          <RouterLink :to="{ name: 'event-detail', params: { id: event.id } }" class="details-btn">
            Bekijk details
          </RouterLink>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

const mockEvents = ref([
  { id: 1, title: 'Openlucht concert', location: 'Centraal Park', date: '10/12/2025' },
  { id: 2, title: 'Tech Meetup', location: 'Campus A', date: '20/11/2025' },
  { id: 3, title: 'Kunstexpo', location: 'Stedelijk Museum', date: '05/12/2025' },
])

const searchEvents = () => {
  console.log('Zoeken naar:', searchQuery.value)
}
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

.search-section {
  width: 100%;
  background-color: #f9f9f9;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.search-bar {
  width: 90%;
  max-width: 800px;
  display: flex;
  gap: 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.search-bar button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.search-bar button:hover {
  background-color: #0056b3;
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
  margin-top: 0.5rem;
  background-color: #00b4d8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
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
