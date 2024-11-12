import express from 'express';
import { 
    addListing, 
    fetchRandomListings, 
    fetchOwnerListingsByRecent, 
    fetchReviews,
    fetchListingById,
 } from '../controllers/listingController.js';

const router = express.Router();
router.post('/add-listing', addListing);
router.get('/fetch-listing-by-id', fetchListingById)
router.get('/fetch-random-listings', fetchRandomListings);
router.get('/fetch-owner-listings-by-recent', fetchOwnerListingsByRecent);
router.get('/fetch-reviews', fetchReviews);

export default router;