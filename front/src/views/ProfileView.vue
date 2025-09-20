<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- User Info -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center space-x-6">
          <img
            :src="userData.avatar"
            :alt="userData.name"
            class="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
          />
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ userData.name }}</h2>
            <p class="text-gray-600">{{ userData.email }}</p>
            <span 
              class="mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full"
              :class="roleClasses"
            >
              {{ formatRole(userData.role) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Trucks Section -->
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Assigned Trucks</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TruckCard
            v-for="truck in userData.trucks"
            :key="truck.id"
            :truck="truck"
            @view-details="handleViewDetails"
            @view-maintenance="handleViewMaintenance"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import TruckCard from '@/components/truck/TruckCard.vue'
import type { User } from '@/stores/user'

const userStore = useUserStore()
const userData = computed<User>(() => userStore.user)

const roleClasses = computed(() => {
  switch (userData.value.role) {
    case 'driver':
      return 'bg-blue-100 text-blue-800'
    case 'manager':
      return 'bg-purple-100 text-purple-800'
    case 'admin':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const handleViewDetails = (truckId: string) => {
  console.log('View details for truck:', truckId)
  // Add navigation or modal logic here
}

const handleViewMaintenance = (truckId: string) => {
  console.log('View maintenance for truck:', truckId)
  // Add navigation or modal logic here
}
</script>