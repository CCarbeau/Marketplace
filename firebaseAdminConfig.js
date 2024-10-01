const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with service account credentials or default credentials
admin.initializeApp({
  // credential: admin.credential.applicationDefault(),  // Use this if you are deploying to a Google Cloud environment
  // Alternatively, you can use a service account key file:
  credential: admin.credential.cert(require('./hobby-9f8d2-firebase-adminsdk-oqpe3-4ee733ca53.json')),
  storageBucket: 'hobby-9f8d2.appspot.com',  // If you're using Firebase Storage
});

// Initialize Firestore, Auth, and Storage services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

// Export services for use in other parts of your app
module.exports = { db, auth, storage };