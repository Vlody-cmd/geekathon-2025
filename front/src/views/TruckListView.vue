<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Trucks</h1>
        <p class="mt-2 text-gray-600">Manage and monitor your fleet of trucks</p>
      </div>

      <!-- Search and Filter Bar -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search trucks by model, license plate..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="in_transit">In Transit</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button
            @click="clearFilters"
            class="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Trucks Grid -->
      <div v-if="filteredTrucks.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No trucks found</h3>
        <p class="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="truck in filteredTrucks"
          :key="truck.id"
          class="cursor-pointer transform transition-transform hover:scale-105"
          @click="goToWorkingZone(truck.id)"
        >
          <TruckCard
            :truck="truck"
            @go-to-working-zone="goToWorkingZone"
            @view-maintenance="viewMaintenance"
          />
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-2xl font-bold text-gray-900">{{ userStore.user.trucks.length }}</div>
          <div class="text-sm text-gray-600">Total Trucks</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-2xl font-bold text-green-600">{{ availableTrucks }}</div>
          <div class="text-sm text-gray-600">Available</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ inTransitTrucks }}</div>
          <div class="text-sm text-gray-600">In Transit</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ maintenanceTrucks }}</div>
          <div class="text-sm text-gray-600">Maintenance</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import TruckCard from '@/components/truck/TruckCard.vue'

const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const statusFilter = ref('')

const filteredTrucks = computed(() => {
  let trucks = userStore.user.trucks

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    trucks = trucks.filter(
      (truck) =>
        truck.model.toLowerCase().includes(query) ||
        truck.licensePlate.toLowerCase().includes(query) ||
        truck.capacity.toLowerCase().includes(query),
    )
  }

  // Filter by status
  if (statusFilter.value) {
    trucks = trucks.filter((truck) => truck.status === statusFilter.value)
  }

  return trucks
})

const availableTrucks = computed(
  () => userStore.user.trucks.filter((truck) => truck.status === 'available').length,
)

const inTransitTrucks = computed(
  () => userStore.user.trucks.filter((truck) => truck.status === 'in_transit').length,
)

const maintenanceTrucks = computed(
  () => userStore.user.trucks.filter((truck) => truck.status === 'maintenance').length,
)

const goToWorkingZone = (truckId: string) => {
  router.push({ name: 'working-zone', params: { truckId } })
}

const viewMaintenance = (truckId: string) => {
  console.log('View maintenance for truck:', truckId)
  // TODO: Implement maintenance view
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}
</script>
