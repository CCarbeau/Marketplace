import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCRRXhJPS771ncUzD_4oBMJIGZCPBpEg00",
    authDomain: "hobby-9f8d2.firebaseapp.com",
    projectId: "hobby-9f8d2",
    storageBucket: "hobby-9f8d2.appspot.com",
    messagingSenderId: "866880896841",
    appId: "1:866880896841:web:30456ebd99bc6e0a1c2498",
    measurementId: "G-EC3RFW3SF5"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native Persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
export { app, auth, db, storage };