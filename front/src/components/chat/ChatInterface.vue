<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow-lg">
    <!-- Chat Header -->
    <div class="p-4 border-b flex justify-between items-center">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span class="text-white text-lg">AI</span>
        </div>
        <h2 class="ml-3 text-lg font-semibold">AI Assistant</h2>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- AI Message -->
      <div class="flex items-start">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
          AI
        </div>
        <div class="ml-3 bg-gray-100 rounded-lg p-3 max-w-[80%]">
          <p class="text-gray-800">Hello! How can I assist you with your logistics tasks today?</p>
        </div>
      </div>

      <!-- User Message -->
      <div class="flex items-start justify-end">
        <div class="mr-3 bg-blue-500 rounded-lg p-3 max-w-[80%]">
          <p class="text-white">I need help with route optimization.</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span class="text-gray-600 text-sm">You</span>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="p-4 border-t">
      <div class="flex space-x-2">
        <input
          type="text"
          v-model="messageInput"
          placeholder="Type your message..."
          class="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="sendMessage"
        />
        <button
          @click="sendMessage"
          class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  (e: 'close'): void
  (e: 'send', message: string): void
}>()

const messageInput = ref('')

const sendMessage = () => {
  if (messageInput.value.trim()) {
    emit('send', messageInput.value)
    messageInput.value = ''
  }
}
</script>
