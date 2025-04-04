import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { toast } from 'sonner';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

class LocationService {
  private static instance: LocationService;
  private isRequestingLocation: boolean = false;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async requestLocationPermissions(): Promise<boolean> {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      
      // If we already have permission, return true
      if (permissionStatus.location === 'granted') {
        return true;
      }
      
      // If we need to request permission
      if (permissionStatus.location === 'prompt') {
        const requestResult = await Geolocation.requestPermissions();
        return requestResult.location === 'granted';
      }
      
      // If permission was denied
      return false;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      toast.error('Failed to request location permissions');
      return false;
    }
  }

  public async getCurrentLocation(): Promise<LocationData | null> {
    if (this.isRequestingLocation) {
      toast.error('Location request already in progress');
      return null;
    }

    try {
      this.isRequestingLocation = true;

      // First check if we have permissions
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        toast.error('Location permission not granted');
        return null;
      }

      // Get the current position with increased timeout and maximumAge
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000, // Increased from 5000 to 10000ms
        maximumAge: 30000, // Accept cached position up to 30 seconds old
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      // More specific error message
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            toast.error('Location permission denied. Please enable location access in settings.');
            break;
          case 2: // POSITION_UNAVAILABLE
            toast.error('Location information unavailable. Please check your device settings.');
            break;
          case 3: // TIMEOUT
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            toast.error('Failed to get location. Please try again.');
        }
      } else {
        toast.error('Failed to get location. Please try again.');
      }
      return null;
    } finally {
      this.isRequestingLocation = false;
    }
  }

  public async watchPosition(
    callback: (location: LocationData) => void,
    errorCallback?: (error: any) => void
  ): Promise<string> {
    try {
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        toast.error('Location permission not granted');
        throw new Error('Location permission not granted');
      }

      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 5000,
        },
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          });
        },
        (error) => {
          console.error('Error watching position:', error);
          if (errorCallback) {
            errorCallback(error);
          }
        }
      );

      return watchId;
    } catch (error) {
      console.error('Error starting location watch:', error);
      toast.error('Failed to start location tracking');
      throw error;
    }
  }

  public async stopWatchingPosition(watchId: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Error stopping location watch:', error);
      toast.error('Failed to stop location tracking');
    }
  }
}

export const locationService = LocationService.getInstance(); 