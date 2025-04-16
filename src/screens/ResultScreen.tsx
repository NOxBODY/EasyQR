import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type ResultScreenRouteProp = {
  params: {
    scannedValue: string;
    location: {
      latitude: number;
      longitude: number;
    } | null;
  };
};

type ResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

const ResultScreen = () => {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute() as ResultScreenRouteProp;
  const { scannedValue, location } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanned QR Code</Text>
      <Text style={styles.result}>{scannedValue}</Text>
      
      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>Scanned at:</Text>
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.scanButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Scan Another Code</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.homeButton]} 
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  result: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '100%',
  },
  locationContainer: {
    width: '100%',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  scanButton: {
    backgroundColor: '#007AFF',
  },
  homeButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ResultScreen; 