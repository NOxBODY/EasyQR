import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Feature: undefined;
  Result: {
    scannedValue: string;
    location: {
      latitude: number;
      longitude: number;
    } | null;
  };
}; 