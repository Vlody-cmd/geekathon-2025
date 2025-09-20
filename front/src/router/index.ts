import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppLayout from '../components/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'trucks',
          name: 'trucks',
          component: () => import('../views/TruckListView.vue'),
        },
        {
          path: 'working-zone/:truckId?',
          name: 'working-zone',
          component: () => import('../views/WorkingZoneView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/ProfileView.vue'), // Reusing ProfileView for now
        },
      ],
    },
  ],
})

export default router
