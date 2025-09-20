<template>
  <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ truck.model }}</h3>
        <p class="text-sm text-gray-600">License: {{ truck.licensePlate }}</p>
      </div>
      <div :class="statusClasses">
        {{ formatStatus(truck.status) }}
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-600">Capacity</p>
        <p class="font-medium">{{ truck.capacity }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">Mileage</p>
        <p class="font-medium">{{ formatMileage(truck.mileage) }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">Last Maintenance</p>
        <p class="font-medium">{{ formatDate(truck.lastMaintenance) }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">Fuel Level</p>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            class="bg-blue-600 h-2.5 rounded-full"
            :style="{ width: truck.fuelLevel + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="truck.currentLocation" class="mt-4">
      <p class="text-sm text-gray-600">Current Location</p>
      <p class="font-medium">{{ truck.currentLocation.address }}</p>
    </div>

    <div class="mt-4 flex justify-end space-x-2">
      <button
        class="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors font-medium"
        @click="$emit('go-to-working-zone', truck.id)"
      >
        Working Zone
      </button>
      <button
        class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        @click="$emit('view-maintenance', truck.id)"
      >
        Maintenance
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TruckDetails } from '@/stores/user'

const props = defineProps<{
  truck: TruckDetails
}>()

defineEmits<{
  (e: 'go-to-working-zone', id: string): void
  (e: 'view-maintenance', id: string): void
}>()

const statusClasses = computed(() => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
  switch (props.truck.status) {
    case 'available':
      return [baseClasses, 'bg-green-100 text-green-800'].join(' ')
    case 'in_transit':
      return [baseClasses, 'bg-blue-100 text-blue-800'].join(' ')
    case 'maintenance':
      return [baseClasses, 'bg-yellow-100 text-yellow-800'].join(' ')
    default:
      return [baseClasses, 'bg-gray-100 text-gray-800'].join(' ')
  }
})

const formatStatus = (status: TruckDetails['status']) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatMileage = (mileage: number) => {
  return mileage.toLocaleString() + ' km'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>
