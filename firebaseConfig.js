const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export services and app as an object
module.exports = { app, auth, db, storage };