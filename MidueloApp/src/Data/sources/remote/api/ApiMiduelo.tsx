// En src/Data/sources/remote/api/ApiMiduelo.tsx
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';



const BASE_URL = 'http://10.26.164.250:3000/api'; // ← Cambia por tu IP


export const API_Miduelo = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Aumenta el timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para logs (para debug)
API_Miduelo.interceptors.request.use(
  (config) => {
    console.log(`🔄 Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.log('❌ Request error:', error);
    return Promise.reject(error);
  }
);

API_Miduelo.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status);
    return response;
  },
  (error) => {
    console.log('❌ Response error:', error.message);
    return Promise.reject(error);
  }
);