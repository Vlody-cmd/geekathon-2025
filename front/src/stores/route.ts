import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface RoutePoint {
  id: string
  position: { lat: number; lng: number }
  title: string
  description?: string
  type: 'pickup' | 'delivery' | 'waypoint' | 'custom'
  order: number
  icon?: string
  info?: string
}

export interface RouteData {
  id: string
  name: string
  description: string
  points: RoutePoint[]
  isActive: boolean
}

export const useRouteStore = defineStore('route', () => {
  const selectedRoute = ref<RouteData | null>(null)

  // Computed property to get all route points sorted by order
  const allRoutePoints = computed(() => {
    if (!selectedRoute.value) return []
    return selectedRoute.value.points || []
  })

  // Computed property to get markers for the map
  const routeMarkers = computed(() => {
    return allRoutePoints.value.map((point) => ({
      position: point.position,
      title: point.title,
      icon: point.icon || getDefaultIcon(point.type),
      info: point.info || generatePointInfo(point),
      pointId: point.id,
      pointType: point.type,
    }))
  })

  // Helper function to get default icons based on point type
  function getDefaultIcon(type: RoutePoint['type']) {
    switch (type) {
      case 'pickup':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      case 'delivery':
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      case 'waypoint':
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      case 'custom':
        return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    }
  }

  // Helper function to generate point info HTML
  function generatePointInfo(point: RoutePoint) {
    return `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-bold text-gray-900">${point.title}</h4>
          <span class="px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(point.type)}">${point.type.charAt(0).toUpperCase() + point.type.slice(1)}</span>
        </div>
        ${point.description ? `<p class="text-sm text-gray-600 mb-2">${point.description}</p>` : ''}
        <div class="space-y-1 text-sm">
          <p><span class="font-medium">Order:</span> ${point.order}</p>
          <p><span class="font-medium">Coordinates:</span> ${point.position.lat.toFixed(4)}, ${point.position.lng.toFixed(4)}</p>
          ${point.type === 'custom' ? '<p class="text-xs text-purple-600 mt-2">Custom waypoint - Click to remove</p>' : ''}
        </div>
      </div>
    `
  }

  // Helper function to get type-specific colors
  function getTypeColor(type: RoutePoint['type']) {
    switch (type) {
      case 'pickup':
        return 'bg-green-100 text-green-800'
      case 'delivery':
        return 'bg-red-100 text-red-800'
      case 'waypoint':
        return 'bg-blue-100 text-blue-800'
      case 'custom':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Actions
  function setSelectedRoute(route: any) {
    // Convert API route data to RouteData format
    if (route && route.routeData) {
      const apiRoute = route.routeData
      const points: RoutePoint[] = []

      if (apiRoute.type === 'Connecting') {
        // Handle connecting routes
        const firstLeg = apiRoute.first_leg
        const secondLeg = apiRoute.second_leg

        if (firstLeg.fromLocation) {
          points.push({
            id: `pickup-${firstLeg.from}`,
            position: firstLeg.fromLocation,
            title: `Pickup: ${firstLeg.from}`,
            description: `${firstLeg.type} - ${firstLeg.weight} tons`,
            type: 'pickup',
            order: 1,
          })
        }

        if (firstLeg.toLocation) {
          points.push({
            id: `connection-${apiRoute.connection_city}`,
            position: firstLeg.toLocation,
            title: `Connection: ${apiRoute.connection_city}`,
            description: `Drop ${firstLeg.type}, Pick ${secondLeg.type}`,
            type: 'waypoint',
            order: 2,
          })
        }

        if (secondLeg.toLocation) {
          points.push({
            id: `delivery-${secondLeg.to}`,
            position: secondLeg.toLocation,
            title: `Delivery: ${secondLeg.to}`,
            description: `${secondLeg.type} - ${secondLeg.weight} tons`,
            type: 'delivery',
            order: 3,
          })
        }
      } else {
        // Handle direct routes
        if (apiRoute.fromLocation) {
          points.push({
            id: `pickup-${apiRoute.from}`,
            position: apiRoute.fromLocation,
            title: `Pickup: ${apiRoute.from}`,
            description: `${apiRoute.type} - ${apiRoute.weight} tons`,
            type: 'pickup',
            order: 1,
          })
        }

        if (apiRoute.toLocation) {
          points.push({
            id: `delivery-${apiRoute.to}`,
            position: apiRoute.toLocation,
            title: `Delivery: ${apiRoute.to}`,
            description: `${apiRoute.type} - ${apiRoute.weight} tons`,
            type: 'delivery',
            order: 2,
          })
        }
      }

      selectedRoute.value = {
        id: route.id,
        name: route.name,
        description: route.description,
        points: points,
        isActive: true,
      }
    } else {
      selectedRoute.value = null
    }
  }

  function clearSelectedRoute() {
    selectedRoute.value = null
  }

  return {
    // State
    selectedRoute,

    // Computed
    allRoutePoints,
    routeMarkers,

    // Actions
    setSelectedRoute,
    clearSelectedRoute,
  }
})
