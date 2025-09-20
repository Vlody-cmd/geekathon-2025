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
  role: 'manager',
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
        address: 'Kyiv, Ukraine',
      },
    },
    {
      id: 'T-002',
      model: 'Mercedes Actros',
      licensePlate: 'XY 5678 EF',
      capacity: '35 tons',
      status: 'in_transit',
      lastMaintenance: '2025-07-20',
      mileage: 89000,
      fuelLevel: 62,
      currentLocation: {
        lat: 49.8397,
        lng: 24.0297,
        address: 'Lviv, Ukraine',
      },
    },
    {
      id: 'T-003',
      model: 'Scania R450',
      licensePlate: 'GH 9012 IJ',
      capacity: '42 tons',
      status: 'maintenance',
      lastMaintenance: '2025-09-10',
      mileage: 245000,
      fuelLevel: 30,
      currentLocation: {
        lat: 46.4825,
        lng: 30.7233,
        address: 'Odesa, Ukraine',
      },
    },
    {
      id: 'T-004',
      model: 'DAF XF',
      licensePlate: 'KL 3456 MN',
      capacity: '38 tons',
      status: 'available',
      lastMaintenance: '2025-06-05',
      mileage: 178000,
      fuelLevel: 95,
      currentLocation: {
        lat: 49.9935,
        lng: 36.2304,
        address: 'Kharkiv, Ukraine',
      },
    },
    {
      id: 'T-005',
      model: 'MAN TGX',
      licensePlate: 'OP 7890 QR',
      capacity: '44 tons',
      status: 'in_transit',
      lastMaintenance: '2025-08-01',
      mileage: 67000,
      fuelLevel: 78,
      currentLocation: {
        lat: 48.4647,
        lng: 35.0462,
        address: 'Dnipro, Ukraine',
      },
    },
    {
      id: 'T-006',
      model: 'Iveco Stralis',
      licensePlate: 'ST 2468 UV',
      capacity: '32 tons',
      status: 'available',
      lastMaintenance: '2025-09-01',
      mileage: 123000,
      fuelLevel: 55,
      currentLocation: {
        lat: 50.4501,
        lng: 30.5234,
        address: 'Kyiv, Ukraine',
      },
    },
  ],
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User>(defaultUser)

  return {
    user,
  }
})
