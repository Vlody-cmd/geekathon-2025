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
      licensePlate: 'AA 12 BB',
      capacity: '40 tons',
      status: 'available',
      lastMaintenance: '2025-08-15',
      mileage: 150000,
      fuelLevel: 85,
      currentLocation: {
        lat: 41.5517,
        lng: -8.4265,
        address: 'Braga, Portugal'
      }
    },
    {
      id: 'T-002',
      model: 'Mercedes-Benz Actros',
      licensePlate: 'CC 34 DD',
      capacity: '35 tons',
      status: 'in_transit',
      lastMaintenance: '2025-09-01',
      mileage: 120000,
      fuelLevel: 65,
      currentLocation: {
        lat: 40.6566,
        lng: -7.9125,
        address: 'Viseu, Portugal'
      }
    },
    {
      id: 'T-003',
      model: 'Scania R500',
      licensePlate: 'EE 56 FF',
      capacity: '38 tons',
      status: 'maintenance',
      lastMaintenance: '2025-09-15',
      mileage: 180000,
      fuelLevel: 30,
      currentLocation: {
        lat: 38.5244,
        lng: -8.8882,
        address: 'Setúbal, Portugal'
      }
    },
    {
      id: 'T-004',
      model: 'DAF XF',
      licensePlate: 'GG 78 HH',
      capacity: '42 tons',
      status: 'available',
      lastMaintenance: '2025-09-10',
      mileage: 90000,
      fuelLevel: 95,
      currentLocation: {
        lat: 39.2369,
        lng: -8.6857,
        address: 'Santarém, Portugal'
      }
    },
    {
      id: 'T-005',
      model: 'MAN TGX',
      licensePlate: 'II 90 JJ',
      capacity: '36 tons',
      status: 'in_transit',
      lastMaintenance: '2025-09-05',
      mileage: 135000,
      fuelLevel: 45,
      currentLocation: {
        lat: 37.7394,
        lng: -8.6589,
        address: 'Sines, Portugal'
      }
    },
    {
      id: 'T-006',
      model: 'Iveco S-Way',
      licensePlate: 'KK 11 LL',
      capacity: '39 tons',
      status: 'available',
      lastMaintenance: '2025-09-12',
      mileage: 110000,
      fuelLevel: 75,
      currentLocation: {
        lat: 38.0333,
        lng: -7.8833,
        address: 'Beja, Portugal'
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