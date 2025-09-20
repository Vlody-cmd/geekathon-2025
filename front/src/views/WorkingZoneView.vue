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

      <!-- Right side - Loads and Chat -->
      <div class="w-1/3 p-4 relative">
        <!-- Loads Panel -->
        <div
          v-if="!isChatOpen"
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
        <div v-else class="h-[calc(100vh-6rem)]">
          <ChatInterface @close="isChatOpen = false" @send="handleChatMessage" />
        </div>

        <!-- Chat Toggle Button -->
        <button
          @click="isChatOpen = !isChatOpen"
          class="absolute bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
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
import { ref, computed, onMounted } from 'vue'
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
const mapCenter = ref<Location>({ lat: 50.4501, lng: 30.5234 }) // Kyiv center

// Get the selected truck based on route parameter
const selectedTruck = computed(() => {
  const truckId = route.params.truckId as string
  if (!truckId) return null
  return userStore.user.trucks.find((truck) => truck.id === truckId) || null
})

// Redirect to truck list if no truck is selected or truck not found
onMounted(() => {
  if (!route.params.truckId) {
    router.push('/trucks')
  } else if (!selectedTruck.value) {
    console.error('Truck not found:', route.params.truckId)
    router.push('/trucks')
  }
})

// City coordinates
const cityCoordinates = {
  kyiv: { lat: 50.4501, lng: 30.5234 },
  lviv: { lat: 49.8397, lng: 24.0297 },
  odesa: { lat: 46.4825, lng: 30.7233 },
  kharkiv: { lat: 49.9935, lng: 36.2304 },
  dnipro: { lat: 48.4647, lng: 35.0462 },
  warsaw: { lat: 52.2297, lng: 21.0122 }
} as const

const loads = ref<Load[]>([
  {
    id: '1',
    type: 'Electronics',
    weight: 15,
    from: 'Kyiv, Ukraine',
    to: 'Lviv, Ukraine',
    distance: 540,
    urgent: true,
    fromLocation: cityCoordinates.kyiv,
    toLocation: cityCoordinates.lviv
  },
  {
    id: '2',
    type: 'Construction Materials',
    weight: 25,
    from: 'Odesa, Ukraine',
    to: 'Kharkiv, Ukraine',
    distance: 830,
    urgent: false,
    fromLocation: cityCoordinates.odesa,
    toLocation: cityCoordinates.kharkiv
  },
  {
    id: '3',
    type: 'Food Products',
    weight: 18,
    from: 'Dnipro, Ukraine',
    to: 'Warsaw, Poland',
    distance: 1250,
    urgent: true,
    fromLocation: cityCoordinates.dnipro,
    toLocation: cityCoordinates.warsaw
  }
])

// Generate routes for each load
const deliveryRoutes = computed(() => {
  const routes = []
  
  for (const load of loads.value) {
    if (load.fromLocation && load.toLocation) {
      routes.push({
        origin: load.fromLocation,
        destination: load.toLocation,
        // Different colors based on urgency
        color: load.urgent ? '#DC2626' : '#2563EB'
      })
    }
  }
  
  return routes
})

const deliveryMarkers = computed(() => {
  const markers = []
  
  // Add markers for all loads
  for (const load of loads.value) {
    if (load.fromLocation) {
      // From location marker
      markers.push({
        position: load.fromLocation,
        title: `Pickup: ${load.from}`,
        info: `
          <div class="p-2">
            <h3 class="font-bold">${load.type}</h3>
            <p>Pickup location: ${load.from}</p>
            <p>Weight: ${load.weight} tons</p>
          </div>
        `
      })
    }
    
    if (load.toLocation) {
      // To location marker
      markers.push({
        position: load.toLocation,
        title: `Delivery: ${load.to}`,
        info: `
          <div class="p-2">
            <h3 class="font-bold">${load.type}</h3>
            <p>Delivery location: ${load.to}</p>
            <p>Distance: ${load.distance} km</p>
          </div>
        `
      })
    }
  }

  return markers
})

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

const formatTruckStatus = (status: TruckDetails['status']) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>