import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TruckDetails {
  id: string
  model: string
  licensePlate: string
  capacity: string
  status: 'available' | 'in_transit' | 'maintenance'
  lastMaintenance: string
  mileage: number
  fuelLevel: number
  currentLocation?: {
    lat: number
    lng: number
    address: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'driver' | 'manager' | 'admin'
  trucks: TruckDetails[]
}

const defaultUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  role: 'driver',
  trucks: [
    {
      id: 'T-001',
      model: 'Volvo FH16',
      licensePlate: 'AB 1234 CD',
      capacity: '40 tons',
      status: 'available',
      lastMaintenance: '2025-08-15',
      mileage: 150000,
      fuelLevel: 85,
      currentLocation: {
        lat: 50.4501,
        lng: 30.5234,
        address: 'Kyiv, Ukraine'
      }
    }
  ]
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User>(defaultUser)

  return {
    user
  }
})