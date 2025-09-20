<template>
  <div class="h-full w-full">
    <div ref="mapContainer" class="h-full w-full rounded-lg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Route {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  color?: string
}

const props = defineProps<{
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    position: { lat: number; lng: number }
    title?: string
    info?: string
  }>
  routes?: Route[]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const markers = ref<google.maps.Marker[]>([])
const infoWindows = ref<google.maps.InfoWindow[]>([])
const directionsRenderers = ref<google.maps.DirectionsRenderer[]>([])

const clearRoutes = () => {
  directionsRenderers.value.forEach(renderer => renderer.setMap(null))
  directionsRenderers.value = []
}

const drawRoute = async (route: Route) => {
  if (!map.value) return

  const directionsService = new google.maps.DirectionsService()
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map.value,
    suppressMarkers: true, // Don't show default markers
    polylineOptions: {
      strokeColor: route.color || '#4A90E2',
      strokeOpacity: 0.8,
      strokeWeight: 5
    }
  })

  try {
    const result = await directionsService.route({
      origin: route.origin,
      destination: route.destination,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    })

    directionsRenderer.setDirections(result)
    directionsRenderers.value.push(directionsRenderer)
  } catch (error) {
    console.error('Error getting directions:', error)
  }
}

const initializeMap = () => {
  if (!mapContainer.value) return

  const mapOptions = {
    center: props.center || { lat: 50.4501, lng: 30.5234 }, // Default to Kyiv
    zoom: props.zoom || 8,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ],
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true
  }

  map.value = new google.maps.Map(mapContainer.value, mapOptions)

  // Add markers if provided
  if (props.markers) {
    props.markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: map.value,
        title: markerData.title,
        animation: google.maps.Animation.DROP
      })

      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.info
        })

        marker.addListener('click', () => {
          infoWindows.value.forEach(window => window.close())
          infoWindow.open(map.value, marker)
        })

        infoWindows.value.push(infoWindow)
      }

      markers.value.push(marker)
    })
  }

  // Draw routes if provided
  if (props.routes) {
    props.routes.forEach(route => drawRoute(route))
  }
}

// Load Google Maps API
const loadGoogleMapsAPI = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', e => reject(e))
    document.head.appendChild(script)
  })
}

// Watch for changes in routes prop
watch(
  () => props.routes,
  (newRoutes) => {
    if (map.value && newRoutes) {
      clearRoutes()
      newRoutes.forEach(route => drawRoute(route))
    }
  },
  { deep: true }
)

// Watch for changes in center prop
watch(
  () => props.center,
  (newCenter) => {
    if (map.value && newCenter) {
      map.value.panTo(newCenter)
    }
  }
)

onMounted(async () => {
  try {
    await loadGoogleMapsAPI()
    initializeMap()
  } catch (error) {
    console.error('Error loading Google Maps:', error)
  }
})

onUnmounted(() => {
  // Cleanup markers and info windows
  markers.value.forEach(marker => marker.setMap(null))
  infoWindows.value.forEach(window => window.close())
  clearRoutes()
})

// Expose map instance for parent component
defineExpose({
  map,
  markers
})
</script>

<style scoped>
/* Add any custom styles here */
</style>