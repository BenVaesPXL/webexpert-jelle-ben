<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>{{ isEdit ? "Event bijwerken" : "Nieuw event" }}</h1>
        <p class="lede">
          Vul de details in en publiceer wanneer je klaar bent.
        </p>
      </div>
    </div>

    <form class="card form" @submit.prevent="handleSubmit">
      <div class="grid">
        <label>
          Titel
          <input v-model="form.title" required />
        </label>
        <label>
          Locatie
          <input v-model="form.location" required />
        </label>
      </div>

      <label>
        Beschrijving
        <textarea v-model="form.description" rows="4" required></textarea>
      </label>

      <div class="grid">
        <label>
          Startdatum
          <input v-model="form.start_date" type="datetime-local" required />
        </label>
        <label>
          Einddatum
          <input v-model="form.end_date" type="datetime-local" required />
        </label>
      </div>

      <label>
        Afbeelding
        <input type="file" accept="image/*" @change="handleImageChange" />
      </label>

      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Event preview" />
        <button type="button" class="btn-remove-image" @click="removeImage">
          Verwijderen
        </button>
      </div>

      <div class="card subtle">
        <div class="tickets-header">
          <div>
            <h3>Tickets</h3>
            <p class="hint">Voeg tickets toe voor dit event.</p>
          </div>
          <button class="btn ghost" type="button" @click="addTicket">
            Ticket toevoegen
          </button>
        </div>

        <div v-if="!tickets.length" class="hint">
          Nog geen tickets toegevoegd.
        </div>

        <div v-for="(ticket, idx) in tickets" :key="idx" class="ticket-row">
          <div class="grid">
            <label>
              Naam
              <input v-model="ticket.type" placeholder="Early Bird" />
            </label>
            <label>
              Prijs
              <input
                v-model.number="ticket.price"
                type="number"
                step="0.01"
                min="0"
              />
            </label>
            <label>
              Aantal
              <input v-model.number="ticket.quantity" type="number" min="1" />
            </label>
          </div>
          <div class="grid">
            <label>
              Verkoop start
              <input v-model="ticket.sale_starts_at" type="datetime-local" />
            </label>
            <label>
              Verkoop einde
              <input v-model="ticket.sale_ends_at" type="datetime-local" />
            </label>
          </div>
          <label>
            Beschrijving
            <textarea
              v-model="ticket.description"
              rows="2"
              placeholder="Optioneel"
            ></textarea>
          </label>
          <div class="ticket-actions">
            <button class="link" type="button" @click="removeTicket(idx)">
              Verwijder ticket
            </button>
          </div>
        </div>
      </div>

      <label class="checkbox">
        <input v-model="form.is_published" type="checkbox" />
        Gepubliceerd
      </label>

      <div v-if="error" class="alert">{{ error }}</div>

      <div class="actions">
        <RouterLink class="btn ghost" :to="{ name: 'admin-events' }"
          >Annuleren</RouterLink
        >
        <button class="btn primary" type="submit" :disabled="submitting">
          {{ submitting ? "Opslaan..." : "Opslaan" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useEventsStore } from "../stores/events";

const route = useRoute();
const router = useRouter();
const eventsStore = useEventsStore();
const error = ref("");
const submitting = ref(false);
const tickets = ref([]);
const originalTicketIds = ref([]);

const isEdit = computed(() => Boolean(route.params.id));

const form = reactive({
  title: "",
  description: "",
  location: "",
  start_date: "",
  end_date: "",
  is_published: false,
});
const imageFile = ref(null);
const imagePreview = ref("");

onMounted(async () => {
  if (isEdit.value) {
    const existing =
      eventsStore.getEventById(route.params.id) ||
      (await eventsStore.fetchEventById(route.params.id));
    if (existing) {
      form.title = existing.title || "";
      form.description = existing.description || "";
      form.location = existing.location || "";
      form.start_date = toDatetimeLocal(existing.start_date);
      form.end_date = toDatetimeLocal(existing.end_date);
      form.is_published = Boolean(existing.is_published);

      if (existing.image) {
        imagePreview.value = `${import.meta.env.VITE_API_BASE.replace(
          "/api",
          ""
        )}/storage/${existing.image}`;
      }

      tickets.value = (existing.tickets || []).map((t) => ({
        id: t.id,
        type: t.type || "",
        price: t.price ?? "",
        quantity: t.quantity ?? "",
        description: t.description || "",
        sale_starts_at: toDatetimeLocal(t.sale_starts_at),
        sale_ends_at: toDatetimeLocal(t.sale_ends_at),
      }));

      originalTicketIds.value = tickets.value
        .filter((t) => t.id)
        .map((t) => t.id);
    }
  }
});

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function handleSubmit() {
  error.value = "";
  submitting.value = true;
  try {
    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("location", form.location);
    formData.append("start_date", form.start_date);
    formData.append("end_date", form.end_date);
    formData.append("is_published", form.is_published ? "1" : "0");

    if (imageFile.value) {
      formData.append("image", imageFile.value);
    }

    const createdEvent = isEdit.value
      ? await eventsStore.updateEventWithFile(route.params.id, formData)
      : await eventsStore.createEventWithFile(formData);

    const eventId = isEdit.value ? route.params.id : createdEvent.id;

    const validTickets = tickets.value.filter(
      (t) => t.type && t.price !== "" && t.quantity
    );

    const keepIds = validTickets.filter((t) => t.id).map((t) => t.id);
    const toDelete = originalTicketIds.value.filter(
      (id) => !keepIds.includes(id)
    );

    for (const id of toDelete) {
      await eventsStore.deleteTicket(eventId, id);
    }

    for (const t of validTickets) {
      const ticketPayload = {
        type: t.type,
        price: Number(t.price),
        quantity: Number(t.quantity),
        description: t.description,
        sale_starts_at: t.sale_starts_at || null,
        sale_ends_at: t.sale_ends_at || null,
      };

      if (t.id) {
        await eventsStore.updateTicket(eventId, t.id, ticketPayload);
      } else {
        await eventsStore.createTicket(eventId, ticketPayload);
      }
    }

    // Refresh event list to reflect ticket changes (admin sees drafts too)
    await eventsStore.fetchEvents();
    router.push({ name: "admin-events" });
  } catch (err) {
    error.value = err.message || "Opslaan mislukt";
  } finally {
    submitting.value = false;
  }
}

function addTicket() {
  tickets.value.push({
    id: null,
    type: "",
    price: "",
    quantity: "",
    description: "",
    sale_starts_at: "",
    sale_ends_at: "",
  });
}

function removeTicket(idx) {
  tickets.value.splice(idx, 1);
}

function handleImageChange(event) {
  const file = event.target.files?.[0];
  if (file) {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result || "";
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  imageFile.value = null;
  imagePreview.value = "";
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

.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.form {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  color: #2b3f55;
}

input,
textarea {
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #cfd8e3;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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

.btn.ghost {
  background: #fff;
  color: #0b5ac2;
}

.card.subtle {
  border: 1px dashed #cfd8e3;
  background: #f8fbff;
}

.tickets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ticket-row {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ticket-actions {
  display: flex;
  justify-content: flex-end;
}

.hint {
  color: #5c6f82;
}

.link {
  background: none;
  border: none;
  color: #0b5ac2;
  cursor: pointer;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.alert {
  background: #ffecec;
  border: 1px solid #f6b8b8;
  color: #9e1b1b;
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.image-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
}

.btn-remove-image {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  align-self: flex-start;
}

.btn-remove-image:hover {
  background: #c0392b;
}
</style>
