<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>Events beheren</h1>
        <p class="lede">
          Maak nieuwe events aan, pas ze aan of zet ze offline.
        </p>
      </div>
      <RouterLink class="btn primary" :to="{ name: 'admin-event-create' }"
        >Nieuw event</RouterLink
      >
    </div>

    <div v-if="error" class="alert">{{ error }}</div>

    <div class="card">
      <div class="table-head">
        <span>Titel</span>
        <span>Locatie</span>
        <span>Datum</span>
        <span>Status</span>
        <span class="actions">Acties</span>
      </div>
      <div v-if="!events.length" class="empty">Geen events gevonden.</div>
      <div v-else class="table-body">
        <div v-for="event in events" :key="event.id" class="row">
          <div>
            <strong>{{ event.title }}</strong>
          </div>
          <div>{{ event.location }}</div>
          <div>{{ formatDate(event.start_date) }}</div>
          <div>
            <span :class="['badge', event.is_published ? 'live' : 'draft']">
              {{ event.is_published ? "Gepubliceerd" : "Concept" }}
            </span>
          </div>
          <div class="actions">
            <RouterLink
              :to="{ name: 'admin-event-edit', params: { id: event.id } }"
              >Bewerken</RouterLink
            >
            <button class="link" @click="confirmDelete(event.id)">
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useEventsStore } from "../stores/events";

const eventsStore = useEventsStore();
const error = ref("");

onMounted(async () => {
  error.value = "";
  try {
    await eventsStore.fetchEvents({ includeDrafts: true });
  } catch (err) {
    error.value = err.message;
  }
});

const events = computed(() => eventsStore.events);

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

async function confirmDelete(id) {
  if (!confirm("Weet je zeker dat je dit event wil verwijderen?")) return;
  error.value = "";
  try {
    await eventsStore.deleteEvent(id);
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  color: #5c6f82;
}

.lede {
  color: #5c6f82;
  margin-top: 0.25rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: 1px solid #0b5ac2;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(120deg, #0b5ac2, #3f8bff);
  color: #fff;
  box-shadow: 0 8px 24px rgba(11, 90, 194, 0.25);
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.table-head,
.row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
  padding: 0.75rem 1rem;
  align-items: center;
}

.table-head {
  background: #f7f9fc;
  font-weight: 700;
  color: #2b3f55;
  border-bottom: 1px solid #e2e8f0;
}

.table-body .row:nth-child(odd) {
  background: #fbfdff;
}

.table-body .row:nth-child(even) {
  background: #fff;
}

.empty {
  padding: 1rem;
  color: #5c6f82;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge.live {
  background: #e8f4ff;
  color: #0b5ac2;
}

.badge.draft {
  background: #fff6e5;
  color: #b97300;
}

button.link {
  border: none;
  background: none;
  color: #d14343;
  cursor: pointer;
  font-weight: 600;
}

.alert {
  background: #ffecec;
  border: 1px solid #f6b8b8;
  color: #9e1b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

@media (max-width: 800px) {
  .table-head,
  .row {
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 0.5rem;
  }

  .row > :nth-child(4),
  .row > :nth-child(5),
  .table-head > :nth-child(4),
  .table-head > :nth-child(5) {
    justify-self: end;
  }
}
</style>
