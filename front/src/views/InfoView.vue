<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">System Information</h1>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- System Status -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
              <div class="space-y-3">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">Server: Online</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">Database: Connected</span>
                </div>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">AI Services: Active</span>
                </div>
              </div>
            </div>

            <!-- Statistics -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Active Trucks:</span>
                  <span class="text-sm font-medium text-gray-900">24</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Active Routes:</span>
                  <span class="text-sm font-medium text-gray-900">18</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Available Loads:</span>
                  <span class="text-sm font-medium text-gray-900">156</span>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Version:</span>
                  <span class="text-sm font-medium text-gray-900">1.0.0</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Last Update:</span>
                  <span class="text-sm font-medium text-gray-900">2024-03-21</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Environment:</span>
                  <span class="text-sm font-medium text-gray-900">Production</span>
                </div>
              </div>
            </div>

            <!-- API Status -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">API Status</h2>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Maps API</span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Route Optimization</span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">AI Services</span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Documentation Links -->
          <div class="mt-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Documentation & Resources</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="#" class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 class="font-medium text-gray-900">API Documentation</h3>
                <p class="text-sm text-gray-600 mt-1">Access API endpoints and integration guides</p>
              </a>
              <a href="#" class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 class="font-medium text-gray-900">User Guide</h3>
                <p class="text-sm text-gray-600 mt-1">Learn how to use the platform effectively</p>
              </a>
              <a href="#" class="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 class="font-medium text-gray-900">Support</h3>
                <p class="text-sm text-gray-600 mt-1">Get help and contact support team</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic will be added here
</script>
