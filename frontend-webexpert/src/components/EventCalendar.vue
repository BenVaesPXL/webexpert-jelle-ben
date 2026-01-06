<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="changeMonth(-1)" class="nav-btn">&lt;</button>
      <h3>{{ currentMonthLabel }}</h3>
      <button @click="changeMonth(1)" class="nav-btn">&gt;</button>
    </div>

    <div class="calendar-grid">
      <!-- Weekday Headers -->
      <div v-for="day in weekDays" :key="day" class="weekday-header">
        {{ day }}
      </div>

      <!-- Calendar Days -->
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': isToday(day.date)
        }"
      >
        <div class="day-number">{{ day.dayNumber }}</div>
        
        <div class="events-list">
          <div
            v-for="event in day.events"
            :key="event.id"
            class="event-chip"
            @click.stop="handleEventClick(event)"
            :title="event.title"
          >
            {{ event.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EventCalendar",
  props: {
    events: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      currentDate: new Date(),
      weekDays: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
    };
  },
  computed: {
    currentMonthLabel() {
      return new Intl.DateTimeFormat("nl-BE", {
        month: "long",
        year: "numeric"
      }).format(this.currentDate);
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      // First day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Determine starting day of week (0 = Sunday, 1 = Monday, etc.)
      // We want Monday as start (0), so we adjust standard JS getDay() (Sun=0)
      let startDayOfWeek = firstDayOfMonth.getDay() - 1;
      if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

      const days = [];

      // Previous month padding
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
          date: date,
          dayNumber: date.getDate(),
          isCurrentMonth: false,
          events: this.getEventsForDate(date)
        });
      }

      // Current month days
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
          date: date,
          dayNumber: i,
          isCurrentMonth: true,
          events: this.getEventsForDate(date)
        });
      }

      // Next month padding to fill grid (42 cells total for consistent height usually, or just until week ends)
      // Let's fill until the end of the week row
      const remainingCells = 42 - days.length; // 6 rows * 7 days
      for (let i = 1; i <= remainingCells; i++) {
         const date = new Date(year, month + 1, i);
         days.push({
           date: date,
           dayNumber: i,
           isCurrentMonth: false,
           events: this.getEventsForDate(date)
         });
      }

      return days;
    }
  },
  methods: {
    changeMonth(delta) {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + delta,
        1
      );
    },
    isSameDate(d1, d2) {
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    },
    isToday(date) {
      return this.isSameDate(date, new Date());
    },
    getEventsForDate(date) {
      return this.events.filter(event => {
        if (!event.start_date) return false;
        const eventDate = new Date(event.start_date);
        return this.isSameDate(date, eventDate);
      });
    },
    handleEventClick(event) {
        // Emit event so parent can decide what to do (e.g., router push)
        this.$emit('event-click', event);
    }
  }
};
</script>

<style scoped>
.calendar-container {
  width: 100%;
  /* max-width removed for full width */
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.calendar-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
}

.nav-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: 100%;
}

.weekday-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #666;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.day-cell {
  min-height: 100px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  transition: background 0.2s;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background: #fcfcfc;
}

.day-cell.other-month {
  background: #f9f9f9;
  color: #ccc;
}

.day-cell.today {
  background: #f0f7ff;
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.day-cell.today .day-number {
  color: #007bff;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.event-chip {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 3px solid #1976d2;
  transition: transform 0.1s;
}

.event-chip:hover {
  transform: scale(1.02);
  background: #bbdefb;
}

@media (max-width: 768px) {
  .day-cell {
    min-height: 80px;
    font-size: 0.8rem;
    padding: 0.25rem;
  }
  
  .event-chip {
    padding: 2px 4px;
    font-size: 0.7rem;
  }
}
</style>
