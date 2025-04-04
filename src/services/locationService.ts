
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Function to get the current location using Capacitor's Geolocation
export const getCurrentLocation = async (): Promise<UserLocation | null> => {
  try {
    const permissions = await Geolocation.checkPermissions();
    
    if (permissions.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      if (request.location !== 'granted') {
        console.error('Location permission not granted');
        return null;
      }
    }
    
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Save user's location to their profile
export const saveUserLocation = async (userId: string, location: UserLocation): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: {
          last_location: {
            latitude: location.latitude,
            longitude: location.longitude,
            updated_at: new Date().toISOString()
          }
        }
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error saving location:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving location:', error);
    return false;
  }
};

// Function to get location from address
export const getLocationFromAddress = async (address: string): Promise<UserLocation | null> => {
  try {
    // This is a placeholder. In a real app, you would use a geocoding service
    // like Google Maps Geocoding API or Mapbox Geocoding API
    console.log('Getting location for address:', address);
    
    // For now, return a dummy location for demo purposes
    return {
      latitude: 48.8566, // Paris coordinates as fallback
      longitude: 2.3522
    };
  } catch (error) {
    console.error('Error getting location from address:', error);
    return null;
  }
};

// Get user's saved location from profile
export const getSavedLocation = async (userId: string): Promise<UserLocation | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .single();
    
    if (error || !data || !data.preferences) {
      console.error('Error getting saved location:', error);
      return null;
    }
    
    const preferences = data.preferences as any;
    
    if (preferences.last_location) {
      return {
        latitude: preferences.last_location.latitude,
        longitude: preferences.last_location.longitude
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting saved location:', error);
    return null;
  }
};

// Get weather data based on location
export const getWeatherForLocation = async (location: UserLocation): Promise<any> => {
  try {
    // This would typically call a weather API service
    // For demo purposes, return mock data
    return {
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 30,
      windSpeed: Math.floor(Math.random() * 30) + 5
    };
  } catch (error) {
    console.error('Error getting weather data:', error);
    return null;
  }
};

// Fix Weather.tsx by exporting an object named locationService with methods
export const locationService = {
  getCurrentLocation,
  saveUserLocation,
  getLocationFromAddress,
  getSavedLocation,
  getWeatherForLocation
};
