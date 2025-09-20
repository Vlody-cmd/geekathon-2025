<template>
  <div class="relative ml-8 group">
    <button
      type="button"
      class="flex items-center focus:outline-none"
      @click="isMenuOpen = !isMenuOpen"
    >
      <img
        :src="user.avatar"
        :alt="user.name"
        class="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
      />
      <span class="ml-2 text-gray-700">{{ user.name }}</span>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isMenuOpen"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
      role="menu"
    >
      <router-link
        to="/profile"
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        role="menuitem"
        @click="isMenuOpen = false"
      >
        Your Profile
      </router-link>
      <router-link
        to="/settings"
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        role="menuitem"
        @click="isMenuOpen = false"
      >
        Settings
      </router-link>
      <button
        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        role="menuitem"
        @click="handleLogout"
      >
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { user } = userStore

const isMenuOpen = ref(false)

const handleLogout = () => {
  isMenuOpen.value = false
  // Add logout logic here
  console.log('Logout clicked')
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (isMenuOpen.value && !(event.target as Element).closest('.group')) {
    isMenuOpen.value = false
  }
}

// Add and remove click event listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
