import { auth, db } from '../config/firebaseAdminConfig.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const registerUser = async (req, res) => {
  const { uid, email, firstName, lastName, username, interests } = req.body;

  try {
    // Verify the Firebase token
    const idToken = req.headers.authorization?.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (decodedToken.uid !== uid) {
      return res.status(403).send({ error: 'Unauthorized request.' });
    }

    // Create the user data object for Firestore
    const userData = {
      seller: false,
      firstName,
      lastName,
      username,
      email,
      interests,
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
      numberOfFollowing: 0,
      numberOfFollowers: 0,
      reviews: [],
      liked: [],
      recentSearches: [],
      balance: 0,
      pfp: '',
      rating: 0,
      itemsSold: 0,
    };

    // Store the user data in Firestore
    await setDoc(doc(db, 'userData', uid), userData);

    res.status(201).send({ message: 'User metadata saved successfully' });
  } catch (error) {
    console.error('Error registering user metadata:', error);
    res.status(500).send({ error: 'Failed to save user metadata.' });
  }
};

export const updateSellerProfile = async (req, res) => {
  try {
    const { sellerId, banner, pfp, username, name, description } = req.body;
    console.log(req.body);

    const userRef = db.collection('userData').doc(sellerId);    

    await userRef.update({
      ...(banner != null && {banner: banner}), 
      ...(pfp != null && {pfp: pfp}), 
      ...(username != null && {username: username}), 
      ...(name != null && {name: name}), 
      ...(description != null && {description: description}), 
    });

    res.status(200).send({ message: 'Profile successfully updated' });

  }catch (error) {
    console.error('Error updating seller profile:', error);
    res.status(500).send({ error: 'Failed to update seller profile' });
  }
}

export const newSeller = async (req, res) => {
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
}

export const fetchSeller = async (req, res) => {
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
        const seller = {
          username: user?.username || 'Unknown',
          pfp: user?.pfp || null,
          rating: user?.rating || 0,
          numberOfFollowers: user?.numberOfFollowers || 0,
          numberOfFollowing: user?.numberOfFollowing || 0,
          itemsSold: user?.itemsSold || 0,
          listings: user?.listings || [],
          id: id,
          banner: user?.banner || null,
          name: user?.name || null,
          description: user?.description || null,
        };
    
        res.status(200).send({message: 'Seller retrieved successfully', seller})
    }catch (error){
        console.error('Error fetching user', error);
        res.status(400).send({error: 'Failed to retrieve user'})
    }
};

export const fetchMessages = async (req, res) => {
  try{
    const { conversationId } = req.query; 

    if (!conversationId){
      return res.status(400).send({error: 'No sellerId or recipientId provided'});
    }

    const docRef = db.collection('conversations').doc(conversationId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).send({ error: 'Seller not found' });
    }

    const conversation = docSnap.data();
    res.status(200).send({message: 'Conversation retrieved successfully', conversation})
  }catch (error){
    console.error('Error fetching messages', error);
    res.status(400).send({error: 'Failed to retrieve messages'})
  }
}

export const fetchConversations = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).send({ error: 'No id provided' });
    }

    const conversationsRef = db.collection('conversations');
    const usersRef = db.collection('userData'); 

    // Fetch conversations where the user is a participant
    const querySnapshot = await conversationsRef
      .where('participants', 'array-contains', id)
      .orderBy('updatedAt', 'desc')
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send({ error: 'No conversations found' });
    }

    // Fetch interlocutor details for each conversation
    const conversations = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const conversationData = doc.data();
        const interlocutorId = conversationData.participants.find((participantId) => participantId !== id);

        if (!interlocutorId) {
          throw new Error('Interlocutor ID not found in conversation');
        }

        const interlocutorDoc = await usersRef.doc(interlocutorId).get();
        if (!interlocutorDoc.exists) {
          throw new Error(`User with ID ${interlocutorId} not found`);
        }

        const interlocutorData = interlocutorDoc.data();

        return {
          id: doc.id,
          interlocutor: {
            id: interlocutorId,
            username: interlocutorData.username,
            pfp: interlocutorData.pfp,
          },
          lastMessage: conversationData.lastMessage,
          messageHistory: conversationData.messageHistory,
          createdAt: conversationData.createdAt,
          updatedAt: conversationData.updatedAt,
        };
      })
    );

    res.status(200).send({
      message: 'Conversations retrieved successfully',
      conversations,
    });
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    res.status(500).send({ error: 'Failed to retrieve conversations' });
  }
};