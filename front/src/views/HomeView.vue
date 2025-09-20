<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">AI Logistics Dashboard</h1>
          <p class="mt-2 text-gray-600">Monitor your fleet and manage logistics operations</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        <!-- Left side - Map -->
        <div class="lg:w-2/3">
          <div class="bg-white rounded-lg shadow-lg h-full">
            <div class="p-4 border-b">
              <h2 class="text-xl font-semibold text-gray-900">Fleet Overview Map</h2>
              <p class="text-sm text-gray-600">Real-time locations of your trucks</p>
            </div>
            <div
              class="h-[calc(100%-5rem)] flex items-center justify-center bg-gray-100 rounded-b-lg"
            >
              <GoogleMap
                :center="mapCenter"
                :zoom="6"
                :markers="truckMarkers"
              />
            </div>
          </div>
        </div>

        <!-- Right side - Truck List -->
        <div class="lg:w-1/3">
          <div class="bg-white rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
            <div class="p-4 border-b">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">My Trucks</h2>
                  <p class="text-sm text-gray-600">{{ userStore.user.trucks.length }} vehicles</p>
                </div>
                <router-link
                  to="/trucks"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </router-link>
              </div>
            </div>

            <!-- Truck List -->
            <div class="flex-1 overflow-y-auto p-4">
              <div class="space-y-3">
                <div
                  v-for="truck in userStore.user.trucks"
                  :key="truck.id"
                  class="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  @click="goToWorkingZone(truck.id)"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium text-gray-900">{{ truck.model }}</h3>
                      <p class="text-xs text-gray-600">{{ truck.licensePlate }}</p>
                    </div>
                    <div
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        truck.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : truck.status === 'in_transit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{ formatTruckStatus(truck.status) }}
                    </div>
                  </div>

                  <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{{ truck.capacity }}</span>
                    <span>{{ truck.currentLocation?.address }}</span>
                  </div>

                  <!-- Fuel Level Bar -->
                  <div class="mt-2">
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Fuel</span>
                      <span>{{ truck.fuelLevel }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        class="bg-blue-600 h-1.5 rounded-full"
                        :style="{ width: truck.fuelLevel + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="border-t p-4">
              <div class="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div class="text-lg font-bold text-green-600">{{ availableTrucks }}</div>
                  <div class="text-xs text-gray-600">Available</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-blue-600">{{ inTransitTrucks }}</div>
                  <div class="text-xs text-gray-600">In Transit</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-yellow-600">{{ maintenanceTrucks }}</div>
                  <div class="text-xs text-gray-600">Maintenance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GoogleMap from '@/components/map/GoogleMap.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Center the map on Ukraine
const mapCenter = ref({
  lat: 49.0384,
  lng: 31.4513
})

const router = useRouter()
const userStore = useUserStore()

const availableTrucks = computed(
  () => userStore.user.trucks.filter((truck) => truck.status === 'available').length,
)

const inTransitTrucks = computed(
  () => userStore.user.trucks.filter((truck) => truck.status === 'in_transit').length,
)

const maintenanceTrucks = computed(
  () => userStore.user.trucks.filter((truck) => truck.status === 'maintenance').length,
)

// Create markers for each truck's location
const truckMarkers = computed(() => {
  return userStore.user.trucks
    .filter(truck => truck.currentLocation) // Only include trucks with location data
    .map(truck => ({
      position: {
        lat: truck.currentLocation!.lat,
        lng: truck.currentLocation!.lng
      },
      status: truck.status,
      title: `${truck.model} - ${truck.licensePlate}`,
      info: `
        <div class="p-3">
          <h3 class="font-bold text-gray-900">${truck.model}</h3>
          <p class="text-sm text-gray-600">${truck.licensePlate}</p>
          <div class="mt-2 space-y-1">
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Status:</span>
              <span class="text-sm font-medium ${
                truck.status === 'available' 
                  ? 'text-green-600' 
                  : truck.status === 'in_transit' 
                    ? 'text-blue-600' 
                    : 'text-yellow-600'
              }">${formatTruckStatus(truck.status)}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Capacity:</span>
              <span class="text-sm">${truck.capacity}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Fuel:</span>
              <span class="text-sm">${truck.fuelLevel}%</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Location:</span>
              <span class="text-sm">${truck.currentLocation!.address}</span>
            </div>
          </div>
          <button
            onclick="window.location.href='/working-zone/${truck.id}'"
            class="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            View Details
          </button>
        </div>
      `
    }))
})

const goToWorkingZone = (truckId: string) => {
  router.push({ name: 'working-zone', params: { truckId } })
}

const formatTruckStatus = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>
