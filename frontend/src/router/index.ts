import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Calendar from "../pages/Calendar.vue";

const routes = [
  { path: "/", redirect: "/calendar" },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/calendar", component: Calendar, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
