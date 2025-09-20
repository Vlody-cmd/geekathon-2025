<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50">
    <div class="flex h-full">
      <!-- Left side - Map -->
      <div class="w-2/3 p-4">
        <div class="bg-white rounded-lg shadow-lg h-[calc(100vh-6rem)]">
          <div class="h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <!-- Placeholder for the map -->
            <div class="text-center">
              <img
                src="https://i.imgur.com/YZU4aPm.png"
                alt="Map Placeholder"
                class="max-w-full max-h-full object-contain rounded-lg"
              />
              <p class="text-gray-500 mt-2">Interactive map will be implemented here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Loads and Chat -->
      <div class="w-1/3 p-4 relative">
        <!-- Loads Panel -->
        <div v-if="!isChatOpen" class="bg-white rounded-lg shadow-lg h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
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
              class="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ load.type }}</h3>
                  <p class="text-sm text-gray-600">{{ load.weight }} tons</p>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    load.urgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
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
                  @click="assignLoad(load)"
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
import { ref } from 'vue'
import ChatInterface from '@/components/chat/ChatInterface.vue'

interface Load {
  id: string
  type: string
  weight: number
  from: string
  to: string
  distance: number
  urgent: boolean
}

const searchQuery = ref('')
const isChatOpen = ref(false)

const loads = ref<Load[]>([
  {
    id: '1',
    type: 'Electronics',
    weight: 15,
    from: 'Kyiv, Ukraine',
    to: 'Lviv, Ukraine',
    distance: 540,
    urgent: true
  },
  {
    id: '2',
    type: 'Construction Materials',
    weight: 25,
    from: 'Odesa, Ukraine',
    to: 'Kharkiv, Ukraine',
    distance: 830,
    urgent: false
  },
  {
    id: '3',
    type: 'Food Products',
    weight: 18,
    from: 'Dnipro, Ukraine',
    to: 'Warsaw, Poland',
    distance: 1250,
    urgent: true
  }
])

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
</script>