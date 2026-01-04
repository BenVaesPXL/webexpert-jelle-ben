<template>
  <div class="event-card">
    <div class="event-image"></div>

    <h4>{{ event.title }}</h4>
    <p class="event-location">Locatie: {{ event.location }}</p>
    <p class="event-date">Start: {{ formattedDate }}</p>

    <div v-if="event.tickets && event.tickets.length" class="ticket-info">
      <p class="event-tickets" v-for="ticket in event.tickets" :key="ticket.id">
        {{ ticket.type }}: {{ ticket.quantity }} beschikbaar
      </p>
    </div>

    <RouterLink
      :to="{ name: 'event-detail', params: { id: event.id } }"
      class="details-btn"
    >
      Bekijk details
    </RouterLink>

    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: "EventCard",
  props: {
    event: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formattedDate() {
      if (!this.event.start_date) return "";
      const dateObj = new Date(this.event.start_date);
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      const date = dateObj.toLocaleDateString("nl-BE", options);
      const time = dateObj.toLocaleTimeString("nl-BE", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${date} om ${time}`;
    },
  },
};
</script>

<style scoped>
.event-card,
.ticket-info {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.event-image {
  width: 100%;
  height: 150px;
  background-color: #eee;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.event-location,
.event-date,
.event-tickets {
  font-size: 0.9rem;
  color: #666;
}

.ticket-info p {
  margin-block: 0.2rem;
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
  display: inline-block;
}

.details-btn:hover {
  background-color: #007bff;
}
</style>
