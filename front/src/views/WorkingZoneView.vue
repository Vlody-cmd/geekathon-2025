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
      lng: selectedTruck.value.currentLocation.lng
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
    await updateMarkers()
    // Update markers periodically
    const interval = setInterval(updateMarkers, 10000)
    onUnmounted(() => clearInterval(interval))
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
  faro: { lat: 37.0193, lng: -7.9304 }
} as const

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
      toLocation: cityCoordinates.porto
    }
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
      toLocation: cityCoordinates.coimbra
    }
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
      toLocation: cityCoordinates.faro
    }
  ]
}

// Get loads for the selected truck
const loads = computed(() => {
  if (!selectedTruck.value) return []
  return truckLoads[selectedTruck.value.id] || []
})

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
    script.addEventListener('error', e => reject(e))
    document.head.appendChild(script)
  })
}

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
      travelMode: window.google.maps.TravelMode.DRIVING
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
        heading: heading
      }
    }
  } catch (error) {
    console.error('Error calculating route position:', error)
  }

  // Fallback to simple interpolation if route calculation fails
  return {
    position: {
      lat: fromLoc.lat + (toLoc.lat - fromLoc.lat) * 0.5,
      lng: fromLoc.lng + (toLoc.lng - fromLoc.lng) * 0.5
    },
    heading: 0
  }
}



const updateMarkers = async () => {
  try {
    await loadGoogleMapsAPI()
    const markers = []
    
    // Add markers for all loads
    for (const load of loads.value) {
      if (load.fromLocation) {
        // Pickup location marker (warehouse icon)
        markers.push({
          position: load.fromLocation,
          title: `Pickup: ${load.from}`,
          icon: {
            path: 'M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 6h16v2H4V6zm0 12v-6h16v6H4z',
            fillColor: load.urgent ? '#DC2626' : '#2563EB',
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#1F2937',
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 12)
          },
          info: `
            <div class="p-3 min-w-[200px]">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-gray-900">${load.type}</h3>
                <span class="px-2 py-1 text-xs font-medium rounded-full ${
                  load.urgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }">${load.urgent ? 'Urgent' : 'Regular'}</span>
              </div>
              <div class="space-y-1 text-sm">
                <p><span class="font-medium">Pickup:</span> ${load.from}</p>
                <p><span class="font-medium">Weight:</span> ${load.weight} tons</p>
                <p><span class="font-medium">Distance:</span> ${load.distance} km</p>
              </div>
            </div>
          `
        })
    }
    
    if (load.toLocation) {
      // Delivery location marker (destination flag icon)
      markers.push({
        position: load.toLocation,
        title: `Delivery: ${load.to}`,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: load.urgent ? '#DC2626' : '#2563EB',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#1F2937',
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 22)
        },
        info: `
          <div class="p-3 min-w-[200px]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-gray-900">${load.type}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full ${
                load.urgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }">${load.urgent ? 'Urgent' : 'Regular'}</span>
            </div>
            <div class="space-y-1 text-sm">
              <p><span class="font-medium">Delivery:</span> ${load.to}</p>
              <p><span class="font-medium">Weight:</span> ${load.weight} tons</p>
              <p><span class="font-medium">Distance:</span> ${load.distance} km</p>
            </div>
          </div>
        `
      })
    }
  }

    deliveryMarkers.value = markers;
  } catch (error) {
    console.error('Error updating markers:', error)
  }
};

// Watch for changes in loads and update markers
watch(loads, async () => {
  await updateMarkers()
}, { immediate: true })

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