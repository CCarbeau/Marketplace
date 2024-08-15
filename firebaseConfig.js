import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCRRXhJPS771ncUzD_4oBMJIGZCPBpEg00",
    authDomain: "hobby-9f8d2.firebaseapp.com",
    projectId: "hobby-9f8d2",
    storageBucket: "hobby-9f8d2.appspot.com",
    messagingSenderId: "866880896841",
    appId: "1:866880896841:web:30456ebd99bc6e0a1c2498",
    measurementId: "G-EC3RFW3SF5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optionally export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;