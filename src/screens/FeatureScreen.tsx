import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Geolocation from '@react-native-community/geolocation';

type FeatureScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Feature'>;

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

const FeatureScreen = () => {
  const navigation = useNavigation<FeatureScreenNavigationProp>();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const device = useCameraDevice('back');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      console.log('Checking permissions...');
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'EasyQR needs access to your location to record where QR codes are scanned.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const coarseLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: 'Location Permission',
            message: 'EasyQR needs access to your location to record where QR codes are scanned.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return (
          fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED ||
          coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled through Info.plist
  };

  const getCurrentLocation = async () => {
    const hasLocationPermission = await requestLocationPermission();
    if (!hasLocationPermission) {
      throw new Error('Location permission denied');
    }
    setLoadingMessage('Getting location...');
    return new Promise<{latitude: number; longitude: number}>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error: GeolocationError) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0 && codes[0].value) {
        setIsLoading(true);
        setLoadingMessage('Processing QR code...');
        
        try {
          setLoadingMessage('Requesting location permission...');
          const location = await getCurrentLocation();
          console.log('Location:', location);
          
          setLoadingMessage('Navigating to results...');
          navigation.navigate('Result', { 
            scannedValue: codes[0].value,
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          });
        } catch (error) {
          console.log('Location failed:', error);
          // If location fails, still navigate with just the QR code value
          navigation.navigate('Result', { 
            scannedValue: codes[0].value,
            location: null
          });
        } finally {
          setIsLoading(false);
          setLoadingMessage('');
        }
      }
    },
  });

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera permission not granted</Text>
      </View>
    );
  } 

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isLoading}
        codeScanner={codeScanner}
        enableZoomGesture={true}
        video={true}
        audio={false}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FeatureScreen; 