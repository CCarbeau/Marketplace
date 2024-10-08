// Import dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51Q2AmbKoG2b0XRLYtU9AC8sQcdDOQLCAzjXxSVKIpXq81b46GteyJIukHvB1sLaJGI25JdenKhdH2yYTSUnkUPxO008uz6UoUc'); 
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth'); // Use require for Firebase
const { doc, setDoc, arrayUnion } = require('firebase/firestore'); // Use require for Firestore
const { auth, db, storage } = require('../firebaseAdminConfig');

const API_URL = 'http://localhost:5000'

// Express setup
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample route to verify the server is running
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/create-stripe-account', async (req, res) => {
  try {
    // Create a Stripe Connect account for the user
    const account = await stripe.accounts.create({
      type: 'express', // Use 'express' for embedded onboarding
      country: 'US', // Replace with the country of the user
      email: req.body.email, // Email associated with the user
    });

    // Generate the onboarding URL for the user
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${API_URL}/(auth)/signUp`, // URL to redirect to if onboarding fails
      return_url: `${API_URL}/(tabs)/profile`, // URL to redirect to after onboarding is complete
      type: 'account_onboarding',
    });

    res.send({
      accountLink: accountLink.url, // This is the onboarding URL
      accountId: account.id, // Store this in your database for future reference
    });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    res.status(500).send({ error: 'Failed to create Stripe account' });
  }
});

// Firebase User Management Example
app.post('/register-user', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, interests } = req.body;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid; 

    const userData = {
      seller: false,
      firstName: firstName,
      lastName: lastName,
      username: username,
      interests: interests,
      address: {},
      payment: {},
      collection: [],
      listings: [],
      drafts: [],
      purchases: [],
      bids: [],
      offers: [],
      sales: [],
      following: [],
      followers: [],
      reviews: [],
      liked: [],
      recentSearches: [],
      balance: 0,
    };

    await setDoc(doc(db, 'userData', uid), userData);

    // Get Firebase ID token for the newly created user
    const idToken = await user.getIdToken();

    res.status(201).send({ uid: uid, 
      token: idToken  });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Firebase Firestore Example (Add Listing)
app.post('/add-listing', async (req, res) => {
  const { downloadURLs, title, description, price, quantity, category, genre, athlete, team, year, brand, set, features, parallel, printRun, cardsInLot, athletes, teams, listingType, duration, offerable, scheduled, date, time, shippingType, weight, shippingProfile, shippingCost } = req.body;

  try {
    // Construct docData based on request body fields
    const docData = {
      images: downloadURLs, // Save all download URLs
      title: title || '', // Default to empty string if title is missing
      description: description || '',
      price: price || 0,
      quantity: quantity || 1,
      category: category || '',
      ...(category && category.slice(-7) === 'Singles' && genre === 'Sports Cards' ? {
        ...(athlete && { athlete }),
        ...(team && { team }),
        ...(year && { year }),
        ...(brand && { brand }),
        ...(set && { set }),
        ...(features && { features }),
        ...(parallel && { parallel }),
        ...(printRun && { printRun }),
      } : {}),
      ...(category && category.slice(-3) === 'Lot' && genre === 'Sports Cards' ? {
        ...(cardsInLot && { cardsInLot }),
        ...(athlete && { athletes: athletes.split(',') }),
        ...(team && { teams: teams.split(',') }),
        ...(year && { year }),
        ...(brand && { brand }),
        ...(set && { set }),
        ...(features && { features }),
      } : {}),
      ...(category && category.slice(-3) === 'Wax' && genre === 'Sports Cards' ? {
        ...(year && { year }),
        ...(brand && { brand }),
        ...(set && { set }),
      } : {}),
      ...(category && category.slice(-5) === 'Break' && genre === 'Sports Cards' ? {
        ...(athlete && { athletes: athlete.split(',') }),
        ...(team && { teams: team.split(',') }),
        ...(year && { year }),
        ...(brand && { brand }),
        ...(set && { set }),
      } : {}),
      ...(genre === 'Sports Memorabilia' ? {
        ...(athlete && { athlete }),
        ...(team && { team }),
        ...(year && { year }),
      } : {}),
      listingType: listingType || 'fixed',
      ...(listingType === 'auction' ? { duration: duration || 0 } : {}),
      offerable: offerable || false,
      scheduled: scheduled || false,
      ...(scheduled ? { date: date || '', time: time || '' } : {}),
      shippingType: shippingType || 'flat',
      ...(shippingType === 'variable' ? { weight: weight || 0, shippingProfile: shippingProfile || '' } : { shippingCost: shippingCost || 0 }),
      likes: 0,
      ownerUID: req.body.ownerUID, 
      pfp: '',
      rating: 0,
      itemsSold: 0,
      createdAt: new Date(),
      random: Math.random(),
    };

    // Add the document to the collection using async/await
    const docRef = await db.collection('listings').add(docData);

    // Get the document ID
    const listingId = docRef.id;
    
    // Generate the URL for the listing
    const listingUrl = `/listing/${listingId}`; 

    const userRef = doc(db, 'users', req.body.ownerUID);
    await userRef.update({
      listing: arrayUnion(listingId),
    })


    res.status(200).send({ 
      message: 'Listing added successfully!', 
      listingUrl: listingUrl,
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to add listing.' });
   
  }
});

app.post('/newSeller', async (req,res) => {
  try {
    const { userId, token } = req.body; // Extract userId and sellerStatus from the request body
    // Verify the token sent from the client
    // const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if the userId from the token matches the userId in the request body
    // if (decodedToken.uid !== userId) {
    //   return res.status(403).send({ error: 'Unauthorized request' });
    // }
    
    // Reference to the user's document in Firestore
    const userRef = db.collection('userData').doc(userId);

    // Update the seller status for the user
    await userRef.update({
      seller: true, 
    });

    res.status(200).send({ message: 'Account successfully updated' });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).send({ error: 'Failed to update account' });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});