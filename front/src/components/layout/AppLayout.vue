<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link to="/" class="flex items-center">
              <span class="text-xl font-bold text-gray-900">AI Logistics</span>
            </router-link>
          </div>
          <div class="flex items-center">
            <router-link
              v-for="item in navigationItems"
              :key="item.path"
              :to="item.path"
              class="ml-8 text-gray-600 hover:text-gray-900"
            >
              {{ item.name }}
            </router-link>
            <UserAvatar />
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import UserAvatar from '@/components/user/UserAvatar.vue'

const navigationItems = [
  { name: 'Home', path: '/' },
  { name: 'My Trucks', path: '/trucks' },
  { name: 'Working Zone', path: '/working-zone' }
  // { name: 'Request Stops', path: '/stops' },
]
</script>
