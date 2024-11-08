import admin from 'firebase-admin';
import serviceAccount from '../../hobby-9f8d2-firebase-adminsdk-oqpe3-4ee733ca53.json' assert { type: 'json' };  // Import the JSON file

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'hobby-9f8d2.appspot.com',  // Firebase Storage Bucket URL
});

// Export Firestore, Auth, and Storage services for use in other files
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();