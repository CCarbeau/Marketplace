import { auth, db } from '../config/firebaseAdminConfig.js';
import { FieldValue} from 'firebase-admin/firestore';

export const like = async (req, res) => {
  try {
    const { listingId, isLiked } = req.body;

    if (!listingId || isLiked === undefined) {
      return res.status(400).send({ error: 'Missing listingId or isLiked parameter' });
    }

    const docRef = db.collection('listings').doc(listingId);

    // Update the likes count on the listing
    if (!isLiked) {
      await docRef.update({ likes: FieldValue.increment(1) });
    } else {
      await docRef.update({ likes: FieldValue.increment(-1) });
    }

    res.status(200).send({ message: 'Successfully updated likes' });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(400).send({ error: 'Failed to handle like' });
  }
};


export const follow = async (req, res) => {
  try {
    const { followee, following } = req.body;

    if (!followee || typeof following === 'undefined') {
      return res.status(400).send({ error: 'Missing parameters' });
    }

    res.status(200).send({ message: 'Successfully updated follow status' });
  } catch (error) {
    console.error('Error updating followers:', error);
    res.status(400).send({ error: 'Error updating followers' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, senderId, recipientId } = req.body;

    if (!message || !senderId || !recipientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const participants = [senderId, recipientId].sort();
    const conversationId = participants.join('_');

    const conversationRef = db.collection('conversations').doc(conversationId);

    await db.runTransaction(async (transaction) => {
      const conversationDoc = await transaction.get(conversationRef);

      if (conversationDoc.exists) {
        // Update existing conversation
        transaction.update(conversationRef, {
          messageHistory: FieldValue.arrayUnion({
            message: message,
            sender: senderId,
            sentAt: new Date().toISOString(),
          }),
          lastMessage: message,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // Create a new conversation
        transaction.set(conversationRef, {
          participants,
          messageHistory: [
            {
              message: message,
              sender: senderId,
              sentAt: new Date().toISOString(), 
            },
          ],
          lastMessage: message,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    res.status(200).json({ message: 'Successfully sent message' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(400).json({ error: 'Error sending message', details: error.message });
  }
};
