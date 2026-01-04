import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

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
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { requiresGuest: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/events",
      name: "admin-events",
      component: () => import("../views/AdminEventsView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/events/create",
      name: "admin-event-create",
      component: () => import("../views/AdminEventFormView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/events/:id/edit",
      name: "admin-event-edit",
      component: () => import("../views/AdminEventFormView.vue"),
      props: true,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (!auth.user) {
    try {
      await auth.fetchUser();
    } catch (err) {
      // ignore errors; user stays null
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ path: "/" });
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return next({ path: "/" });
  }

  return next();
});

export default router;
