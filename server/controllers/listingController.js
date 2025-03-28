import { db } from '../config/firebaseAdminConfig.js';
import { FieldValue } from 'firebase-admin/firestore';

export const addListing = async (req, res) => {
  try {
    const {
      downloadURLs,
      title,
      description,
      price,
      condition,
      grader,
      grade,
      certificationNumber,
      quality,
      quantity,
      category,
      genre,
      athlete,
      team,
      year,
      brand,
      set,
      features,
      parallel,
      printRun,
      cardsInLot,
      athletes,
      teams,
      listingType,
      duration,
      offerable,
      scheduled,
      date,
      time,
      shippingType,
      weight,
      shippingProfile,
      shippingCost,
      ownerUID,
    } = req.body;

    // Validate required fields
    if (!title || price == null || !ownerUID) {
      return res.status(400).send({ error: 'Missing required fields: title, price, or ownerUID.' });
    }

    const docData = {
      images: downloadURLs || [],
      title: title || '',
      description: description || '',
      price: price || 0,
      condition: condition || 'ungraded',
      ...(condition === 'graded' && ({grader})),
      ...(condition === 'graded' && ({grade})),
      ...((condition === 'graded' && certificationNumber) && {certificationNumber}),
      ...(condition === 'ungraded' && ({quality})),
      quantity: quantity || 1,
      category: category || '',
      sold: false,
      ...(category && category.slice(-7) === 'Singles' && genre === 'Sports Cards'
        ? {
            ...(athlete && { athlete }),
            ...(team && { team }),
            ...(year && { year }),
            ...(brand && { brand }),
            ...(set && { set }),
            ...(features && { features }),
            ...(parallel && { parallel }),
            ...(printRun && { printRun }),
          }
        : {}),
      ...(category && category.slice(-3) === 'Lot' && genre === 'Sports Cards'
        ? {
            ...(cardsInLot && { cardsInLot }),
            ...(athletes && { athletes: athletes.split(',') }),
            ...(teams && { teams: teams.split(',') }),
            ...(year && { year }),
            ...(brand && { brand }),
            ...(set && { set }),
            ...(features && { features }),
          }
        : {}),
      ...(category && category.slice(-3) === 'Wax' && genre === 'Sports Cards'
        ? {
            ...(year && { year }),
            ...(brand && { brand }),
            ...(set && { set }),
          }
        : {}),
      ...(category && category.slice(-5) === 'Break' && genre === 'Sports Cards'
        ? {
            ...(athletes && { athletes: athletes.split(',') }),
            ...(teams && { teams: teams.split(',') }),
            ...(year && { year }),
            ...(brand && { brand }),
            ...(set && { set }),
          }
        : {}),
      ...(genre === 'Sports Memorabilia'
        ? {
            ...(athlete && { athlete }),
            ...(team && { team }),
            ...(year && { year }),
          }
        : {}),
      listingType: listingType || 'fixed',
      ...(listingType === 'auction' && { duration: duration || 0 }),
      ...(listingType === 'auction' && { bids: [] }),
      ...(listingType === 'auction' && { bidCount: 0 }),
      offerable: offerable || false,
      scheduled: scheduled || false,
      ...(scheduled ? { date: date || '', time: time || '' } : {}),
      shippingType: shippingType || 'flat',
      ...(shippingType === 'variable'
        ? { weight: weight || 0, shippingProfile: shippingProfile || '' }
        : { shippingCost: shippingCost || 0 }),
      likes: 0,
      ownerUID: ownerUID,
      createdAt: new Date(),
      ...(listingType === 'auction' && {
        endDate: new Date(Date.now() + (duration || 0) * 1000),
      }),
      random: Math.random(),
    };

    const docRef = await db.collection('listings').add(docData);

    await db.collection('userData').doc(ownerUID).update({
      listings: FieldValue.arrayUnion(docRef.id),
    });

    res.status(200).send({ message: 'Listing added successfully!', listingUrl: `/listing/${docRef.id}` });
  } catch (error) {
    console.error('Error adding listing:', error.message);
    res.status(500).send({ error: 'Failed to add listing. Please try again.' });
  }
};

export const fetchRandomListings = async (req, res) => {
  try {
    let { numListings, sellerId, category, listingId, active } = req.query;

    numListings = parseInt(numListings, 10) || 1;

    const randInt = Math.random();
    const sortDirection = Math.random() < 0.5 ? '<=' : '>=';

    const listingsRef = db.collection('listings');
    
    let querySnapshot; 
    if(category != 'undefined'){
      querySnapshot = await listingsRef
          .where('category', '==', category)
          .where('sold','==', !Boolean(active))
          .where('random', sortDirection, randInt)
          .limit(parseInt(numListings, 10))
          .get();
    }else if (sellerId != 'undefined'){     
      querySnapshot = await listingsRef
          .where('ownerUID', '==', sellerId)
          .where('sold','==', !Boolean(active))
          .where('random', sortDirection, randInt)
          .limit(parseInt(numListings, 10))
          .get();
    }else{
      querySnapshot = await listingsRef
      .where('sold','==', !Boolean(active))
      .where('random', sortDirection, randInt)
      .limit(parseInt(numListings, 10))
      .get();
    }


    // If no documents are found, switch direction and try again
    if (querySnapshot.empty) {
      const alternateDirection = sortDirection === '<=' ? '>=' : '<=';
      if(category != 'undefined'){
        querySnapshot = await listingsRef
            .where('category', '==', category)
            .where('sold','==', !Boolean(active))
            .where('random', alternateDirection, randInt)
            .limit(parseInt(numListings, 10))
            .get();
      }else if (sellerId != 'undefined'){
        querySnapshot = await listingsRef
            .where('ownerUID', '==', sellerId)
            .where('sold','==', !Boolean(active))
            .where('random', alternateDirection, randInt)
            .limit(parseInt(numListings, 10))
            .get();
      }else{
        querySnapshot = await listingsRef
        .where('sold','==', !Boolean(active))
        .where('random', alternateDirection, randInt)
        .limit(parseInt(numListings, 10))
        .get();
      }
    }

    const listings = querySnapshot.docs
    .filter((doc) => doc.id !== listingId)
    .map((doc) => {
      const listing = doc.data();
      return {
        id: doc.id,
        images: listing.images,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        listingType: listing.listingType,
        likes: listing.likes,
        createdAt: listing.createdAt,
        bids: listing.bids,
        duration: listing.duration,
        ownerUID: listing.ownerUID,
        offerable: listing.offerable,
      };
    });

    res.status(200).send({
      message: 'Successfully retrieved random listings',
      listings,
    });
  } catch (error) {
    console.error('Error retrieving listing:', error);
    res.status(500).send({ error: 'Failed to retrieve listing' });
  }
};

export const fetchListingById = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).send({ error: 'Listing Id is required' });
        }
        const docRef = db.collection('listings').doc(id);
        const docSnap = await docRef.get()
        const listing = docSnap.data();

        res.status(200).send({ message: 'Listing retrieved successfully', listing });
    } catch (error) {
        console.error('Error retrieving listing:', error);
        res.status(500).send({ error: 'Failed to retrieve listing' });
    }
};

export const fetchOwnerListingsByRecent = async (req, res) => {
    try {
        const { numListings, sellerId, sold } = req.query;
    
        if (!sellerId) {
          return res.status(400).send({ error: 'sellerId is required' });
        }
        const otherListingsRef = db.collection('listings'); // Use Firestore from firebase-admin
        const querySnapshot = await otherListingsRef
          .where('ownerUID', '==', sellerId)
          .where('sold','==', Boolean(sold))
          .orderBy('createdAt', 'desc')
          .limit(parseInt(numListings, 10))
          .get();
    
        const listings = querySnapshot.docs
        .map((doc) => {
          const listing = doc.data()
          const listingData = {
            id: doc.id,
            images: [listing.images[0]],
            title: listing.title,
            description: listing.description,
            price: listing.price,
            quantity: listing.quantity,
            listingType: listing.listingType,
            likes: listing.likes,
            createdAt: listing.createdAt,
            bids: listing.bids,
            duration: listing.duration,
          }
          
          return (listingData);
        });
    
        res.status(200).send({ message: 'Other Listings retrieved successfully', listings });
    } catch (error) {
        console.error('Error retrieving other listings:', error);
        res.status(500).send({ error: 'Failed to retrieve other listings' });
    }
};

export const fetchMostExpensive = async (req, res) => {
  try {
    const listingsRef = db.collection('listings');

    const querySnapshot = await listingsRef
      .where('bidCount', '>', 0) 
      .orderBy('price', 'desc') 
      .limit(10) 
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send({ error: 'No listings found' });
    }

    // Map results
    const listings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send({
      message: 'Listings retrieved successfully',
      listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).send({ error: 'Failed to retrieve listings' });
  }
};

export const fetchMostBid = async (req, res) => {
  try {
    const listingsRef = db.collection('listings');

    // Query Firestore
    const querySnapshot = await listingsRef
      .where('bidCount', '>', 0) 
      .orderBy('bidCount', 'desc') 
      .limit(10)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send({ error: 'No listings found' });
    }

    // Map results
    const listings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send({
      message: 'Listings retrieved successfully',
      listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).send({ error: 'Failed to retrieve listings' });
  }
};

export const fetchMostLiked = async (req, res) => {
  try {
    const listingsRef = db.collection('listings');

    const querySnapshot = await listingsRef
      .where('likes', '>', 0) 
      .orderBy('likes', 'desc') 
      .limit(10) 
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send({ error: 'No listings found' });
    }

    const listings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send({
      message: 'Listings with the most likes retrieved successfully',
      listings,
    });
  } catch (error) {
    console.error('Error fetching listings with the most likes:', error);
    res.status(500).send({ error: 'Failed to retrieve listings' });
  }
};

export const fetchEndingSoonest = async (req, res) => {
  try {
    const listingsRef = db.collection('listings');

    const querySnapshot = await listingsRef
      .where('endDate', '>', new Date())
      .orderBy('endDate', 'asc') 
      .limit(10) 
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send({ error: 'No listings found' });
    }

    const listings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send({
      message: 'Listings ending the soonest retrieved successfully',
      listings,
    });
  } catch (error) {
    console.error('Error fetching listings ending the soonest:', error);
    res.status(500).send({ error: 'Failed to retrieve listings' });
  }
};

export const fetchMostRecent = async (req, res) => {
  try {
    const listingsRef = db.collection('listings');

    const querySnapshot = await listingsRef
      .orderBy('createdAt', 'desc')
      .limit(10) 
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send({ error: 'No listings found' });
    }

    const listings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send({
      message: 'Most recent listings retrieved successfully',
      listings,
    });
  } catch (error) {
    console.error('Error fetching most recent listings:', error);
    res.status(500).send({ error: 'Failed to retrieve listings' });
  }
};

export const fetchReviews = async (req, res) => {
    try {
        const { sellerId } = req.query;
    
        if (!sellerId) {
          return res.status(400).send({ error: 'sellerId is required' });
        }
    
        const reviewsRef = db.collection('reviews'); 
        const querySnapshot = await reviewsRef
          .where('sellerId', '==', sellerId)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();
    
        const reviews = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const reviewData = doc.data();
          const reviewerId = reviewData.reviewerId;
    
          
          const userDoc = await db.collection('userData').doc(reviewerId).get();
          const userData = userDoc.exists ? userDoc.data() : { pfp: null, username: 'Unknown' };
    
          
          return {
            ...reviewData,
            createdAt: reviewData.createdAt.toDate().toISOString(), 
            reviewerPfp: userData.pfp,
            reviewerUsername: userData.username,
          };
        }));
    
        res.status(200).send({ message: 'Reviews retrieved successfully', reviews });
    } catch (error) {
        console.error('Error retrieving reviews:', error);
        res.status(500).send({ error: 'Failed to retrieve reviews' });
    }
}