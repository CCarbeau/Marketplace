// Import dependencies
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { errorHandler } from './middlewear/errorHandler.js';
import authRoutes from './routes/authRoutes.js'
import listingRoutes from './routes/listingRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js'
import userInputRoutes from './routes/userInputRoutes.js'

// Express setup
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Base route
app.get('/', (req, res) => res.send('Backend is running'));

// Routes
app.use('/auth', authRoutes);
app.use('/listings', listingRoutes);
app.use('/sellers', sellerRoutes);
app.use('/stripe', stripeRoutes);
app.use('/user-input', userInputRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});