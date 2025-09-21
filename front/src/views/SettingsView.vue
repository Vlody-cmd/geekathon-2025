<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Fleet Management
          </h2>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            @click="currentTab = tab.id"
            :class="[
              currentTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Content -->
      <div class="mt-6">
        <!-- Trucks Tab -->
        <div v-if="currentTab === 'trucks'" class="space-y-4">
          <div v-for="truck in trucks" :key="truck.id" class="bg-white shadow rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-medium">{{ truck.model }}</h3>
                <p class="text-sm text-gray-500">{{ truck.licensePlate }}</p>
              </div>
              <button class="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
          </div>
        </div>

        <!-- Drivers Tab -->
        <div v-if="currentTab === 'drivers'" class="space-y-4">
          <div v-for="driver in drivers" :key="driver.id" class="bg-white shadow rounded-lg p-6">
            <div class="flex items-center space-x-6">
              <img :src="driver.image" alt="" class="w-16 h-16 rounded-full" />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900">{{ driver.name }}</h3>
                  <span 
                    :class="[
                      driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                      'px-2.5 py-0.5 rounded-full text-xs font-medium'
                    ]"
                  >
                    {{ driver.status }}
                  </span>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500">License</p>
                    <p class="font-medium">{{ driver.license }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Experience</p>
                    <p class="font-medium">{{ driver.experience }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Phone</p>
                    <p class="font-medium">{{ driver.phone }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Assigned Truck</p>
                    <p class="font-medium">{{ driver.assignedTruck || 'None' }}</p>
                  </div>
                </div>
                <div class="mt-4 flex justify-end space-x-3">
                  <button class="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button 
                    v-if="!driver.assignedTruck"
                    class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Assign Truck
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="currentTab === 'settings'" class="bg-white shadow rounded-lg p-6">
          <form @submit.prevent="saveSettings" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                v-model="settings.companyName"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Language</label>
              <select
                v-model="settings.language"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const tabs = [
  { id: 'trucks', name: 'Trucks' },
  { id: 'drivers', name: 'Drivers' },
  { id: 'settings', name: 'Settings' }
]

const currentTab = ref('trucks')
const trucks = ref(userStore.user.trucks)
const drivers = ref([
  {
    id: 'D1',
    name: 'João Silva',
    license: 'PT-12345',
    phone: '+351 912 345 678',
    experience: '5 years',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    assignedTruck: 'T-001'
  },
  {
    id: 'D2',
    name: 'Maria Santos',
    license: 'PT-67890',
    phone: '+351 923 456 789',
    experience: '3 years',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    assignedTruck: 'T-002'
  },
  {
    id: 'D3',
    name: 'Manuel Costa',
    license: 'PT-11223',
    phone: '+351 934 567 890',
    experience: '7 years',
    status: 'break',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    assignedTruck: null
  }
])
const settings = ref({
  companyName: 'AI Logistics',
  language: 'en'
})

const saveSettings = () => {
  // Implement settings save logic
  console.log('Saving settings:', settings.value)
}
</script>