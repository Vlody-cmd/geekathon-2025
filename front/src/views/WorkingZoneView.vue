<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50">
    <!-- Truck Information Header -->
    <div v-if="selectedTruck" class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="router.push('/trucks')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ selectedTruck.model }}</h1>
              <p class="text-sm text-gray-600">
                {{ selectedTruck.licensePlate }} • {{ selectedTruck.capacity }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                selectedTruck.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : selectedTruck.status === 'in_transit'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800',
              ]"
            >
              {{ formatTruckStatus(selectedTruck.status) }}
            </div>
            <div class="text-sm text-gray-600">
              <span class="font-medium">{{ selectedTruck.currentLocation?.address }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex h-full">
      <!-- Left side - Map -->
      <div class="w-2/3 p-4">
        <div class="bg-white rounded-lg shadow-lg h-[calc(100vh-6rem)]">
          <GoogleMap
            :center="mapCenter"
            :zoom="8"
            :markers="deliveryMarkers"
            :routes="deliveryRoutes"
          />
        </div>
      </div>

      <!-- Right side - Destination/Routes or Loads and Chat -->
      <div class="w-1/3 p-4 relative">
        <!-- Destination Input Panel (for available trucks) -->
        <div
          v-if="!isChatOpen && selectedTruck?.status === 'available' && !showRoutes"
          class="bg-white rounded-lg shadow-lg h-[calc(100vh-6rem)] overflow-hidden flex flex-col"
        >
          <div class="p-4 border-b">
            <h2 class="text-xl font-semibold text-gray-900">Plan Route</h2>
            <p class="text-sm text-gray-600 mt-1">Enter destination to see available routes</p>
          </div>

          <div class="flex-1 p-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <div class="p-3 bg-gray-50 rounded-md">
                  <div class="flex items-center">
                    <svg
                      class="w-5 h-5 text-green-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-sm font-medium">{{
                      selectedTruck.currentLocation?.address
                    }}</span>
                  </div>
                </div>
              </div>

              <div>
                <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
                  Destination City
                </label>
                <input
                  id="destination"
                  v-model="destinationInput"
                  type="text"
                  placeholder="Enter city name (e.g., Lisboa, Porto, Coimbra...)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @keyup.enter="searchRoutes"
                />
              </div>

              <button
                @click="searchRoutes"
                :disabled="!destinationInput.trim() || isLoadingRoutes"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="isLoadingRoutes" class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Finding Routes...
                </span>
                <span v-else>Find Routes</span>
              </button>

              <!-- Quick destination buttons -->
              <div class="mt-6">
                <p class="text-sm font-medium text-gray-700 mb-3">Quick Destinations</p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="city in quickDestinations"
                    :key="city"
                    @click="selectQuickDestination(city)"
                    class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {{ city }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Routes Display Panel (for available trucks after destination input) -->
        <div
          v-if="!isChatOpen && selectedTruck?.status === 'available' && showRoutes"
          class="bg-white rounded-lg shadow-lg h-[calc(100vh-6rem)] overflow-hidden flex flex-col"
        >
          <div class="p-4 border-b">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Available Routes</h2>
                <p class="text-sm text-gray-600">To {{ selectedDestination }}</p>
              </div>
              <button
                @click="goBackToDestinationInput"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <!-- Loading State -->
            <div v-if="isLoadingRoutes" class="text-center text-gray-500 mt-8">
              <svg
                class="w-12 h-12 mx-auto text-gray-300 mb-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p>Loading routes...</p>
            </div>

            <!-- No Routes Found -->
            <div
              v-else-if="!isLoadingRoutes && availableRoutes.length === 0"
              class="text-center text-gray-500 mt-8"
            >
              <svg
                class="w-12 h-12 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p>No routes found for this destination</p>
            </div>

            <div
              v-for="(route, index) in availableRoutes"
              :key="index"
              class="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              @click="selectRoute(route)"
              :class="{ 'border-blue-500 bg-blue-50': selectedRoute?.id === route.id }"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="font-medium text-gray-900">{{ route.name }}</h3>
                  <p class="text-sm text-gray-600">{{ route.description }}</p>
                  <div class="flex items-center mt-1 space-x-2">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        route.type === 'Direct'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800',
                      ]"
                    >
                      {{ route.type || 'Direct' }}
                    </span>
                    <span
                      v-if="route.urgent"
                      class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                    >
                      Urgent
                    </span>
                  </div>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    route.recommended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ route.recommended ? 'Recommended' : 'Alternative' }}
                </span>
              </div>

              <!-- Load Information -->
              <div class="mb-3 p-2 bg-gray-50 rounded">
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span class="text-gray-500">Load:</span>
                    <span class="ml-1 font-medium">{{ route.loadType || route.type }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3"
                      />
                    </svg>
                    <span class="text-gray-500">Weight:</span>
                    <span class="ml-1 font-medium">{{ route.weight }}</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="space-y-1">
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span class="text-gray-500">Duration:</span>
                    <span class="ml-1 font-medium">{{ route.duration }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    <span class="text-gray-500">Distance:</span>
                    <span class="ml-1 font-medium">{{ route.distance }}</span>
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <span class="text-gray-500">Fuel Cost:</span>
                    <span class="ml-1 font-medium">€{{ route.fuelCost }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span class="text-gray-500">Priority:</span>
                    <span
                      class="ml-1 font-medium"
                      :class="
                        route.trafficLevel === 'low'
                          ? 'text-green-600'
                          : route.trafficLevel === 'medium'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      "
                    >
                      {{ route.trafficLevel.charAt(0).toUpperCase() + route.trafficLevel.slice(1) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-3 flex justify-end">
                <button
                  @click.stop="startRoute(route)"
                  class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Start Route
                </button>
              </div>
            </div>
          </div>

          <!-- Routes Error -->
          <div v-if="routesError" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center">
              <svg
                class="w-5 h-5 text-yellow-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-sm text-yellow-700">{{ routesError }}</p>
            </div>
          </div>
        </div>

        <!-- Loads Panel (for non-available trucks) -->
        <div
          v-if="!isChatOpen && selectedTruck?.status !== 'available'"
          class="bg-white rounded-lg shadow-lg h-[calc(100vh-6rem)] overflow-hidden flex flex-col"
        >
          <div class="p-4 border-b">
            <h2 class="text-xl font-semibold text-gray-900">Available Loads</h2>
            <div class="mt-2 flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search loads..."
                class="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <button
                @click="filterLoads"
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Filter
              </button>
            </div>
          </div>

          <!-- Loads List -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="loads.length === 0" class="text-center text-gray-500 mt-4">
              No available loads found
            </div>
            <div
              v-for="load in loads"
              :key="load.id"
              class="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              @click="selectLoad(load)"
              :class="{ 'border-blue-500': selectedLoad?.id === load.id }"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ load.type }}</h3>
                  <p class="text-sm text-gray-600">{{ load.weight }} tons</p>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    load.urgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{ load.urgent ? 'Urgent' : 'Regular' }}
                </span>
              </div>
              <div class="mt-2 space-y-1">
                <div class="flex items-center text-sm">
                  <span class="text-gray-500 w-20">From:</span>
                  <span class="text-gray-900">{{ load.from }}</span>
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-gray-500 w-20">To:</span>
                  <span class="text-gray-900">{{ load.to }}</span>
                </div>
                <div class="flex items-center text-sm">
                  <span class="text-gray-500 w-20">Distance:</span>
                  <span class="text-gray-900">{{ load.distance }} km</span>
                </div>
              </div>
              <div class="mt-3 flex justify-end">
                <button
                  @click.stop="assignLoad(load)"
                  class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Assign Load
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Panel -->
        <div v-if="isChatOpen" class="h-[calc(100vh-6rem)]">
          <ChatInterface @close="isChatOpen = false" @send="handleChatMessage" />
        </div>

        <!-- Chat Toggle Button -->
        <button
          @click="isChatOpen = !isChatOpen"
          class="absolute bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-10"
        >
          <svg
            v-if="!isChatOpen"
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <svg
            v-else
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ChatInterface from '@/components/chat/ChatInterface.vue'
import GoogleMap from '@/components/map/GoogleMap.vue'
import type { TruckDetails } from '@/stores/user'

interface Location {
  lat: number
  lng: number
}

interface Load {
  id: string
  type: string
  weight: number
  from: string
  to: string
  distance: number
  urgent: boolean
  fromLocation?: Location
  toLocation?: Location
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const isChatOpen = ref(false)
const selectedLoad = ref<Load | null>(null)
const deliveryMarkers = ref([])
const deliveryRoutes = ref([])

// New reactive variables for destination and routes
const destinationInput = ref('')
const showRoutes = ref(false)
const selectedDestination = ref('')
const availableRoutes = ref([])
const selectedRoute = ref(null)
const isLoadingRoutes = ref(false)
const routesError = ref('')

// Load Google Maps API
const loadGoogleMapsAPI = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', (e) => reject(e))
    document.head.appendChild(script)
  })
}

// Get the selected truck based on route parameter
const selectedTruck = computed(() => {
  const truckId = route.params.truckId as string
  if (!truckId) return null
  return userStore.user.trucks.find((truck) => truck.id === truckId) || null
})

// Center map on selected truck's location
const mapCenter = computed(() => {
  if (selectedTruck.value?.currentLocation) {
    return {
      lat: selectedTruck.value.currentLocation.lat,
      lng: selectedTruck.value.currentLocation.lng,
    }
  }
  // Default to central Portugal if no truck selected
  return { lat: 39.5, lng: -8.8 }
})

// Redirect to truck list if no truck is selected or truck not found
onMounted(async () => {
  if (!route.params.truckId) {
    router.push('/trucks')
  } else if (!selectedTruck.value) {
    console.error('Truck not found:', route.params.truckId)
    router.push('/trucks')
  } else {
    // await updateMarkers()
    // Update markers periodically
    // const interval = setInterval(updateMarkers, 10000)
    // onUnmounted(() => clearInterval(interval))
  }
})

// Portuguese city coordinates
const cityCoordinates = {
  braga: { lat: 41.5517, lng: -8.4265 },
  porto: { lat: 41.1579, lng: -8.6291 },
  viseu: { lat: 40.6566, lng: -7.9125 },
  coimbra: { lat: 40.2033, lng: -8.4103 },
  lisboa: { lat: 38.7223, lng: -9.1393 },
  setubal: { lat: 38.5244, lng: -8.8882 },
  beja: { lat: 38.0333, lng: -7.8833 },
  faro: { lat: 37.0193, lng: -7.9304 },
} as const

// Quick destination options
const quickDestinations = ['Lisboa', 'Porto', 'Coimbra', 'Faro', 'Braga', 'Setúbal']

// Truck-specific loads based on truck ID
const truckLoads = {
  'T-001': [
    {
      id: '1',
      type: 'Electronics',
      weight: 15,
      from: 'Braga, Portugal',
      to: 'Porto, Portugal',
      distance: 55,
      urgent: true,
      fromLocation: cityCoordinates.braga,
      toLocation: cityCoordinates.porto,
    },
  ],
  'T-002': [
    {
      id: '2',
      type: 'Construction Materials',
      weight: 25,
      from: 'Viseu, Portugal',
      to: 'Coimbra, Portugal',
      distance: 95,
      urgent: false,
      fromLocation: cityCoordinates.viseu,
      toLocation: cityCoordinates.coimbra,
    },
  ],
  'T-003': [
    {
      id: '3',
      type: 'Food Products',
      weight: 18,
      from: 'Lisboa, Portugal',
      to: 'Faro, Portugal',
      distance: 280,
      urgent: true,
      fromLocation: cityCoordinates.lisboa,
      toLocation: cityCoordinates.faro,
    },
  ],
}

// Get loads for the selected truck
const loads = computed(() => {
  if (!selectedTruck.value) return []
  return truckLoads[selectedTruck.value.id] || []
})

// Format truck status for display
const formatTruckStatus = (status: TruckDetails['status']) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Update routes and markers when loads change
const updateRoutesAndMarkers = () => {
  const routes = []
  const markers = []

  // Always show the truck's current location
  if (selectedTruck.value?.currentLocation) {
    const truckColor =
      selectedTruck.value.status === 'available'
        ? '00C853' // green
        : selectedTruck.value.status === 'in_transit'
          ? '2196F3' // blue
          : 'FFC107' // yellow/amber for maintenance

    const truckIcon = {
      path: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
      fillColor: '#' + truckColor,
      fillOpacity: 1,
      strokeColor: '#263238',
      strokeWeight: 1,
      scale: 1.5,
      anchor: { x: 12, y: 12 },
    }

    markers.push({
      position: selectedTruck.value.currentLocation,
      title: `${selectedTruck.value.model} - ${selectedTruck.value.licensePlate}`,
      icon: truckIcon,
      info: `
        <div class="p-3">
          <h3 class="font-bold text-gray-900">${selectedTruck.value.model}</h3>
          <p class="text-sm text-gray-600">${selectedTruck.value.licensePlate}</p>
          <div class="mt-2 space-y-1">
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Status:</span>
              <span class="text-sm font-medium ${
                selectedTruck.value.status === 'available'
                  ? 'text-green-600'
                  : selectedTruck.value.status === 'in_transit'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
              }">${formatTruckStatus(selectedTruck.value.status)}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Location:</span>
              <span class="text-sm">${selectedTruck.value.currentLocation.address}</span>
            </div>
          </div>
        </div>
      `,
    })
  }

  // Only show routes and delivery markers if truck is in_transit
  if (selectedTruck.value?.status === 'in_transit') {
    for (const load of loads.value) {
      if (load.fromLocation && load.toLocation) {
        // Add route
        routes.push({
          origin: load.fromLocation,
          destination: load.toLocation,
          // Different colors based on urgency
          color: load.urgent ? '#DC2626' : '#2563EB',
        })

        // Add begin marker
        markers.push({
          position: load.fromLocation,
          title: `Pickup: ${load.from}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          info: `<div class="p-3"><strong>Start Point:</strong> ${load.from}</div>`,
        })

        // Add end marker
        markers.push({
          position: load.toLocation,
          title: `Delivery: ${load.to}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          info: `<div class="p-3"><strong>End Point:</strong> ${load.to}</div>`,
        })
      }
    }
  }

  deliveryMarkers.value = markers
  deliveryRoutes.value = routes
}

// Watch for changes in loads or truck status and update markers/routes
watch([loads, selectedTruck], updateRoutesAndMarkers, { immediate: true })

// Calculate a position along the route
const calculateRoutePosition = async (fromLoc: Location, toLoc: Location) => {
  await loadGoogleMapsAPI()

  try {
    // Create a DirectionsService instance
    const directionsService = new window.google.maps.DirectionsService()

    // Create the route request
    const request = {
      origin: { lat: fromLoc.lat, lng: fromLoc.lng },
      destination: { lat: toLoc.lat, lng: toLoc.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }

    // Get the route
    const result = await directionsService.route(request)

    if (result.routes[0] && result.routes[0].overview_path) {
      const path = result.routes[0].overview_path
      // Get a random point index from the path
      const randomIndex = Math.floor(Math.random() * (path.length - 1))
      const point = path[randomIndex]

      // Calculate heading based on current and next point
      const nextPoint = path[randomIndex + 1]
      const heading = window.google.maps.geometry.spherical.computeHeading(point, nextPoint)

      return {
        position: { lat: point.lat(), lng: point.lng() },
        heading: heading,
      }
    }
  } catch (error) {
    console.error('Error calculating route position:', error)
  }

  // Fallback to simple interpolation if route calculation fails
  return {
    position: {
      lat: fromLoc.lat + (toLoc.lat - fromLoc.lat) * 0.5,
      lng: fromLoc.lng + (toLoc.lng - fromLoc.lng) * 0.5,
    },
    heading: 0,
  }
}

// const updateMarkers = async () => {
//   try {
//     await loadGoogleMapsAPI()
//     const markers = []

//     // Add markers for all loads
//     for (const load of loads.value) {
//       if (load.fromLocation) {
//         // Pickup location marker (warehouse icon)
//         markers.push({
//           position: load.fromLocation,
//           title: `Pickup: ${load.from}`,
//           icon: {
//             path: 'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 6h16v2H4V6zm0 12v-6h16v6H4z',
//             fillColor: load.urgent ? '#DC2626' : '#2563EB',
//             fillOpacity: 1,
//             strokeWeight: 1,
//             strokeColor: '#1F2937',
//             scale: 1.5,
//             anchor: new window.google.maps.Point(12, 12)
//           },
//           info: `
//             <div class="p-3 min-w-[200px]">
//               <div class="flex items-center justify-between mb-2">
//                 <h3 class="font-bold text-gray-900">${load.type}</h3>
//                 <span class="px-2 py-1 text-xs font-medium rounded-full ${
//                   load.urgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
//                 }">${load.urgent ? 'Urgent' : 'Regular'}</span>
//               </div>
//               <div class="space-y-1 text-sm">
//                 <p><span class="font-medium">Pickup:</span> ${load.from}</p>
//                 <p><span class="font-medium">Weight:</span> ${load.weight} tons</p>
//                 <p><span class="font-medium">Distance:</span> ${load.distance} km</p>
//               </div>
//             </div>
//           `
//         })
//     }

//     if (load.toLocation) {
//       // Delivery location marker (destination flag icon)
//       markers.push({
//         position: load.toLocation,
//         title: `Delivery: ${load.to}`,
//         icon: {
//           path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
//           fillColor: load.urgent ? '#DC2626' : '#2563EB',
//           fillOpacity: 1,
//           strokeWeight: 1,
//           strokeColor: '#1F2937',
//           scale: 1.5,
//           anchor: new window.google.maps.Point(12, 22)
//         },
//         info: `
//           <div class="p-3 min-w-[200px]">
//             <div class="flex items-center justify-between mb-2">
//               <h3 class="font-bold text-gray-900">${load.type}</h3>
//               <span class="px-2 py-1 text-xs font-medium rounded-full ${
//                 load.urgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
//               }">${load.urgent ? 'Urgent' : 'Regular'}</span>
//             </div>
//             <div class="space-y-1 text-sm">
//               <p><span class="font-medium">Delivery:</span> ${load.to}</p>
//               <p><span class="font-medium">Weight:</span> ${load.weight} tons</p>
//               <p><span class="font-medium">Distance:</span> ${load.distance} km</p>
//             </div>
//           </div>
//         `
//       })
//     }
//   }

//     deliveryMarkers.value = markers;
//   } catch (error) {
//     console.error('Error updating markers:', error)
//   }
// };

// Watch for changes in loads and update markers
// watch(loads, async () => {
//   // await updateMarkers()
// }, { immediate: true })

const selectLoad = (load: Load) => {
  selectedLoad.value = load
  // Center map on the "from" location of the selected load
  if (load.fromLocation) {
    mapCenter.value = load.fromLocation
  }
}

const filterLoads = () => {
  // Implement load filtering logic here
  console.log('Filtering loads with query:', searchQuery.value)
}

const assignLoad = (load: Load) => {
  console.log('Assigning load:', load)
  // Implement load assignment logic here
}

const handleChatMessage = (message: string) => {
  console.log('Sending message:', message)
  // Implement chat message handling here
}

// New methods for destination and route handling
const selectQuickDestination = (city: string) => {
  destinationInput.value = city
  searchRoutes()
}

const searchRoutes = async () => {
  if (!destinationInput.value.trim()) return

  selectedDestination.value = destinationInput.value.trim()
  showRoutes.value = true

  // Fetch routes from API instead of generating mock routes
  await fetchRoutesFromAPI(selectedDestination.value)
}

const generateMockRoutes = (destination: string) => {
  const currentLocation = selectedTruck.value?.currentLocation
  if (!currentLocation) return

  // Calculate approximate distance (simplified calculation)
  const destCoords = getCityCoordinates(destination.toLowerCase())
  const distance = destCoords
    ? calculateDistance(currentLocation, destCoords)
    : Math.floor(Math.random() * 300) + 50

  // Generate 2-3 route options
  const routes = [
    {
      id: '1',
      name: 'Fastest Route',
      description: 'Via highways and main roads',
      duration: `${Math.floor((distance / 80) * 60)} min`,
      distance: `${distance} km`,
      fuelCost: Math.floor(distance * 0.15),
      trafficLevel: 'medium',
      recommended: true,
    },
    {
      id: '2',
      name: 'Scenic Route',
      description: 'Through countryside and smaller towns',
      duration: `${Math.floor((distance / 60) * 60)} min`,
      distance: `${distance + 20} km`,
      fuelCost: Math.floor((distance + 20) * 0.15),
      trafficLevel: 'low',
      recommended: false,
    },
  ]

  // Add a third route for longer distances
  if (distance > 150) {
    routes.push({
      id: '3',
      name: 'Economy Route',
      description: 'Fuel-efficient path avoiding tolls',
      duration: `${Math.floor((distance / 65) * 60)} min`,
      distance: `${distance + 10} km`,
      fuelCost: Math.floor((distance + 10) * 0.12),
      trafficLevel: 'low',
      recommended: false,
    })
  }

  availableRoutes.value = routes
}

const getCityCoordinates = (cityName: string) => {
  const normalizedName = cityName
    .toLowerCase()
    .replace(/[áàâã]/g, 'a')
    .replace(/[éê]/g, 'e')
    .replace(/[í]/g, 'i')
    .replace(/[óôõ]/g, 'o')
    .replace(/[ú]/g, 'u')
  return cityCoordinates[normalizedName] || null
}

const calculateDistance = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) => {
  const R = 6371 // Earth's radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.floor(R * c)
}

const selectRoute = (route: any) => {
  selectedRoute.value = route
}

const fetchRoutesFromAPI = async (destination: string) => {
  if (!selectedTruck.value?.currentLocation) return

  isLoadingRoutes.value = true
  routesError.value = ''
  availableRoutes.value = []

  try {
    // Extract current city from address or use coordinates
    const currentCity = selectedTruck.value.currentLocation.address.split(',')[0].trim()

    // Build query parameters
    const params = new URLSearchParams({
      currentCity: currentCity,
      destinationCity: destination,
    })

    const response = await fetch(`http://localhost:7072/api/loads/suggestions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse = await response.json()
    console.log('API Response:', apiResponse)

    // Transform API response to route format
    if (
      apiResponse.success &&
      apiResponse.data &&
      apiResponse.data.routes &&
      Array.isArray(apiResponse.data.routes)
    ) {
      const routes = apiResponse.data.routes

      // Map API response to expected route format
      availableRoutes.value = routes.map((apiRoute, index) => {
        // Handle both direct and connecting routes
        const isConnecting = apiRoute.type === 'Connecting'

        // Calculate estimated time based on distance (rough estimate: 60 km/h average)
        const estimatedTimeMinutes = Math.round(
          ((apiRoute.distance || apiRoute.total_distance || 100) / 60) * 60,
        )
        const hours = Math.floor(estimatedTimeMinutes / 60)
        const minutes = estimatedTimeMinutes % 60
        const estimatedTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

        // Calculate fuel cost (rough estimate: €0.15 per km)
        const distance = apiRoute.distance || apiRoute.total_distance || 100
        const fuelCost = Math.round(distance * 0.15)

        return {
          id: apiRoute.id || `route-${index}`,
          name: isConnecting
            ? `Multi-Stop Route via ${apiRoute.connection_city}`
            : `Direct Route to ${apiRoute.to}`,
          description: isConnecting
            ? `${apiRoute.first_leg.from} → ${apiRoute.connection_city} → ${apiRoute.second_leg.to}`
            : `Direct delivery from ${apiRoute.from} to ${apiRoute.to}`,
          duration: apiRoute.estimated_time ? `${apiRoute.estimated_time}h` : estimatedTime,
          distance: `${distance} km`,
          fuelCost: fuelCost,
          trafficLevel: apiRoute.urgent ? 'high' : 'medium',
          recommended: index === 0, // First route is recommended
          type: apiRoute.type,
          loadType: isConnecting
            ? `${apiRoute.first_leg.type} + ${apiRoute.second_leg.type}`
            : apiRoute.type,
          weight: isConnecting
            ? `${apiRoute.first_leg.weight + apiRoute.second_leg.weight} tons`
            : `${apiRoute.weight} tons`,
          urgent: apiRoute.urgent || false,
          // Store original route data for map display
          routeData: apiRoute,
        }
      })

      console.log(`Loaded ${availableRoutes.value.length} routes from API`)

      // Update map with route markers
      updateMapWithRoutes(routes)
    } else {
      // No valid routes found in API response
      console.warn('API response does not contain expected route format:', apiResponse)
      availableRoutes.value = []
      routesError.value = 'No routes found from API. Please try a different destination.'
    }
  } catch (error) {
    console.error('Error fetching routes:', error)
    routesError.value =
      'Failed to fetch routes from server. Please check your connection and try again.'
    availableRoutes.value = []
  } finally {
    isLoadingRoutes.value = false
  }
}

const startRoute = (route: any) => {
  console.log('Starting route:', route)

  if (!selectedTruck.value) return

  // Here you would typically:
  // 1. Update truck status to 'in_transit'
  // 2. Create a new load/delivery
  // 3. Navigate to tracking view

  alert(`Starting ${route.name} to ${selectedDestination.value}`)
}

const updateMapWithRoutes = (routes: any[]) => {
  const markers = []
  const routePaths = []

  // Always show the truck's current location
  if (selectedTruck.value?.currentLocation) {
    const truckColor =
      selectedTruck.value.status === 'available'
        ? '00C853' // green
        : selectedTruck.value.status === 'in_transit'
          ? '2196F3' // blue
          : 'FFC107' // yellow/amber for maintenance

    const truckIcon = {
      path: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
      fillColor: '#' + truckColor,
      fillOpacity: 1,
      strokeColor: '#263238',
      strokeWeight: 1,
      scale: 1.5,
      anchor: { x: 12, y: 12 },
    }

    markers.push({
      position: selectedTruck.value.currentLocation,
      title: `${selectedTruck.value.model} - ${selectedTruck.value.licensePlate}`,
      icon: truckIcon,
      info: `
        <div class="p-3">
          <h3 class="font-bold text-gray-900">${selectedTruck.value.model}</h3>
          <p class="text-sm text-gray-600">${selectedTruck.value.licensePlate}</p>
          <div class="mt-2 space-y-1">
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Status:</span>
              <span class="text-sm font-medium ${
                selectedTruck.value.status === 'available'
                  ? 'text-green-600'
                  : selectedTruck.value.status === 'in_transit'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
              }">${formatTruckStatus(selectedTruck.value.status)}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-500 w-20 text-sm">Location:</span>
              <span class="text-sm">${selectedTruck.value.currentLocation.address}</span>
            </div>
          </div>
        </div>
      `,
    })
  }

  // Add markers and routes for suggested loads
  routes.forEach((route, index) => {
    const routeColor = route.urgent ? '#DC2626' : '#2563EB'

    if (route.type === 'Connecting') {
      // Handle connecting routes with two legs
      const firstLeg = route.first_leg
      const secondLeg = route.second_leg

      // Get coordinates for cities
      const fromCoords = getCityCoordinates(firstLeg.from.toLowerCase())
      const connectionCoords = getCityCoordinates(route.connection_city.toLowerCase())
      const toCoords = getCityCoordinates(secondLeg.to.toLowerCase())

      if (fromCoords && connectionCoords && toCoords) {
        // Add pickup marker
        markers.push({
          position: fromCoords,
          title: `Pickup: ${firstLeg.from}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          info: `
            <div class="p-3">
              <h4 class="font-bold text-gray-900">Pickup Location</h4>
              <p class="text-sm text-gray-600">${firstLeg.from}</p>
              <p class="text-sm"><strong>Load:</strong> ${firstLeg.type}</p>
              <p class="text-sm"><strong>Weight:</strong> ${firstLeg.weight} tons</p>
            </div>
          `,
        })

        // Add connection marker
        markers.push({
          position: connectionCoords,
          title: `Connection: ${route.connection_city}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
          info: `
            <div class="p-3">
              <h4 class="font-bold text-gray-900">Connection Point</h4>
              <p class="text-sm text-gray-600">${route.connection_city}</p>
              <p class="text-sm">Transfer between loads</p>
            </div>
          `,
        })

        // Add delivery marker
        markers.push({
          position: toCoords,
          title: `Delivery: ${secondLeg.to}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          info: `
            <div class="p-3">
              <h4 class="font-bold text-gray-900">Final Delivery</h4>
              <p class="text-sm text-gray-600">${secondLeg.to}</p>
              <p class="text-sm"><strong>Load:</strong> ${secondLeg.type}</p>
              <p class="text-sm"><strong>Weight:</strong> ${secondLeg.weight} tons</p>
            </div>
          `,
        })

        // Add route paths
        routePaths.push({
          origin: fromCoords,
          destination: connectionCoords,
          color: routeColor,
        })
        routePaths.push({
          origin: connectionCoords,
          destination: toCoords,
          color: routeColor,
        })
      }
    } else {
      // Handle direct routes
      const fromCoords = getCityCoordinates(route.from.toLowerCase())
      const toCoords = getCityCoordinates(route.to.toLowerCase())

      if (fromCoords && toCoords) {
        // Add pickup marker
        markers.push({
          position: fromCoords,
          title: `Pickup: ${route.from}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          info: `
            <div class="p-3">
              <h4 class="font-bold text-gray-900">Pickup Location</h4>
              <p class="text-sm text-gray-600">${route.from}</p>
              <p class="text-sm"><strong>Load:</strong> ${route.type}</p>
              <p class="text-sm"><strong>Weight:</strong> ${route.weight} tons</p>
            </div>
          `,
        })

        // Add delivery marker
        markers.push({
          position: toCoords,
          title: `Delivery: ${route.to}`,
          icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          info: `
            <div class="p-3">
              <h4 class="font-bold text-gray-900">Delivery Location</h4>
              <p class="text-sm text-gray-600">${route.to}</p>
              <p class="text-sm"><strong>Load:</strong> ${route.type}</p>
              <p class="text-sm"><strong>Weight:</strong> ${route.weight} tons</p>
            </div>
          `,
        })

        // Add route path
        routePaths.push({
          origin: fromCoords,
          destination: toCoords,
          color: routeColor,
        })
      }
    }
  })

  deliveryMarkers.value = markers
  deliveryRoutes.value = routePaths
}

const goBackToDestinationInput = () => {
  showRoutes.value = false
  selectedRoute.value = null
  availableRoutes.value = []
  routesError.value = ''
  // Reset map to show only truck
  updateRoutesAndMarkers()
}
</script>
