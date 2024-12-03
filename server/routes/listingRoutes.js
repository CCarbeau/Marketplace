import express from 'express';
import { 
    addListing, 
    fetchRandomListings, 
    fetchOwnerListingsByRecent, 
    fetchReviews,
    fetchListingById,
    fetchMostExpensive,
    fetchMostBid,
    fetchMostLiked,
    fetchEndingSoonest,
    fetchMostRecent,
 } from '../controllers/listingController.js';

const router = express.Router();
router.post('/add-listing', addListing);
router.get('/fetch-listing-by-id', fetchListingById)
router.get('/fetch-random-listings', fetchRandomListings);
router.get('/fetch-owner-listings-by-recent', fetchOwnerListingsByRecent);
router.get('/fetch-reviews', fetchReviews);
router.get('/fetch-most-expensive', fetchMostExpensive);
router.get('/fetch-most-bid', fetchMostBid);
router.get('/fetch-most-liked', fetchMostLiked);
router.get('/fetch-ending-soonest', fetchEndingSoonest);
router.get('/fetch-most-recent', fetchMostRecent)

export default router;