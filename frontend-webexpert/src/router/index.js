import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/event/:id",
      name: "event-detail",
      component: () => import("../views/EventDetailView.vue"),
      props: true,
    },
    {
      path: "/events",
      name: "events",
      component: () => import("../views/EventListView.vue"),
    },
  ],
});

export default router;
