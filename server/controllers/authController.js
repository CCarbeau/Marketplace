import { auth, db } from '../config/firebaseAdminConfig.js';

export const verifyToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ valid: false, message: 'Token is required' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    res.status(200).send({ valid: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send({ valid: false, message: 'Invalid or expired token' });
  }
};

export const fetchActiveUser = async(req, res) => {

  try{ 
    const { id } = req.query;

    if (!id){
      return res.status(400).send({error: 'No id provided'});
    }

    const docRef = db.doc(`userData/${id}`); 
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).send({ error: 'Seller not found' });
    }

    const user = docSnap.data();

    const profile = {
      address: user.address, 
      banner: user.banner,
      bids: user.bids,
      collection: user.collection,
      description: user.description,
      firstName: user.firstName, 
      following: user.following,
      id: id, 
      itemsSold: user.itemsSold,
      interests: user.interests,
      lastName: user.lastName, 
      listings: user.listings,
      name: user.name,
      numberOfFollowers: user.numberOfFollowers,
      numberOfFollowing: user.numberOfFollowing, 
      payment: user.payment,
      pfp: user.pfp,
      rating: user.rating,
      recentSearches: user.recentSearches,
      seller: user.seller,
      username: user.username,
    }

    res.status(200).send(profile);
  }catch(error){
    res.status(404).send({error: 'Error fetching active user'});
  }
}