import { db } from '../config/firebaseAdminConfig.js';

export const addListing = async (req, res) => {
  try {
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
        createdAt: new Date(),
        random: Math.random(),
      };

    const docRef = await db.collection('listings').add(docData);

    await db.collection('userData').doc(req.body.ownerUID).update({
      listings: arrayUnion(docRef.id),
    });

    res.status(200).send({ message: 'Listing added successfully!', listingUrl: `/listing/${docRef.id}` });
  } catch (error) {
    res.status(500).send({ error: 'Failed to add listing.' });
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
      if(category){
        querySnapshot = await listingsRef
            .where('category', '==', category)
            .where('sold','==', !Boolean(active))
            .where('random', alternateDirection, randInt)
            .limit(parseInt(numListings, 10))
            .get();
      }else if (sellerId){
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

export const fetchReviews = async (req, res) => {
    try {
        const { sellerId } = req.query;
    
        if (!sellerId) {
          return res.status(400).send({ error: 'sellerId is required' });
        }
    
        const reviewsRef = db.collection('reviews'); // Use Firestore from firebase-admin
        const querySnapshot = await reviewsRef
          .where('sellerId', '==', sellerId)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();
    
        const reviews = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const reviewData = doc.data();
          const reviewerId = reviewData.reviewerId;
    
          // Fetch the reviewer's profile picture and username from the users collection
          const userDoc = await db.collection('userData').doc(reviewerId).get();
          const userData = userDoc.exists ? userDoc.data() : { pfp: null, username: 'Unknown' };
    
          // Combine review data with reviewer information
          return {
            ...reviewData,
            createdAt: reviewData.createdAt.toDate().toISOString(), // Convert Firestore Timestamp to ISO string
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