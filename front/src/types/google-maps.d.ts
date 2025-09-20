declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any
        Marker: new (options: any) => any
        InfoWindow: new (options: any) => any
        LatLng: new (lat: number, lng: number) => any
        DirectionsService: new () => any
        DirectionsRenderer: new (options?: any) => any
        TravelMode: {
          DRIVING: string
          WALKING: string
          BICYCLING: string
          TRANSIT: string
        }
        geometry: {
          spherical: {
            computeHeading: (from: any, to: any) => number
          }
        }
      }
    }
  }
}

export interface Location {
  lat: number
  lng: number
}

export interface Load {
  id: string
  type: string
  weight: number
  from: string
  to: string
  distance: number
  urgent: boolean
  fromLocation: Location
  toLocation: Location
}

export interface Marker {
  position: Location
  title: string
  icon?: {
    path: string
    fillColor: string
    fillOpacity: number
    strokeWeight: number
    strokeColor: string
    scale: number
    anchor: any
    rotation?: number
  }
  info?: string
  status?: string
}

export {}
