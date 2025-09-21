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
    <div class="flex-1 p-4 overflow-y-auto space-y-4" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" class="flex flex-col">
        <!-- User Message -->
        <div v-if="message.type === 'user'" class="flex justify-end mb-2">
          <div class="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-[80%]">
            {{ message.content }}
          </div>
        </div>
        <!-- AI Response -->
        <div v-else class="flex justify-start mb-2">
          <div class="bg-gray-100 rounded-lg py-2 px-4 max-w-[80%]">
            {{ message.content }}
          </div>
        </div>
      </div>
      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-gray-100 rounded-lg py-2 px-4">
          <div class="flex space-x-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
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
          :disabled="isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="isLoading || !messageInput.trim()"
          class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
import { ref, onMounted, nextTick } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'send', message: string): void
}>()

const messageInput = ref('')
const messages = ref<Array<{ type: 'user' | 'ai'; content: string }>>([])
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const message = messageInput.value.trim()
  if (!message || isLoading.value) return

  // Add user message to chat
  messages.value.push({ type: 'user', content: message })
  messageInput.value = ''
  await scrollToBottom()

  // Show loading state
  isLoading.value = true

  try {
    // Send message to API
    const response = await fetch('http://localhost:7072/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    
    // Add AI response to chat
    messages.value.push({ type: 'ai', content: data.response })
    await scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    messages.value.push({ 
      type: 'ai', 
      content: 'Sorry, I encountered an error. Please try again.' 
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

// Initialize with a welcome message
onMounted(() => {
  messages.value.push({ 
    type: 'ai', 
    content: 'Hello! I\'m your AI assistant. How can I help you today?' 
  })
})
</script>
