import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Lazy load components
const Home = () => import('@/views/Home.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Rial Exchange Rates Archive',
      description:
        'Interactive web application for visualizing Iranian Rial exchange rates',
    },
  },
  // Add more routes as needed
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = (to.meta?.title as string) || 'Rial Exchange Rates Archive';

  // Set meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && to.meta?.description) {
    metaDescription.setAttribute('content', to.meta.description as string);
  }

  next();
});

export default router;
