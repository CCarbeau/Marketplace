import { auth, db } from '../config/firebaseAdminConfig.js';
import { FieldValue } from 'firebase-admin/firestore';

export const like = async (req, res) => {
    try {
      const { id, newLikes } = req.body;
  
      if (!id || newLikes === undefined) {
        return res.status(400).send({ error: 'Missing id or newLikes parameter' });
      }
  
      const docRef = db.collection('listings').doc(id); 
      await docRef.update({ likes: Number(newLikes) }); 
  
      res.status(200).send({ message: 'Successfully updated likes' });
    } catch (error) {
      console.error('Error updating likes:', error);
      res.status(400).send({ error: 'Failed to handle like' });
    }
  };

export const follow = async (req, res) => {
    try{
        const { follower, followee } = req.body;

        if(!follower || ! followee){
            return res.status(400).send({ error: 'Missing follower or followee parameter' });
        }

        const docRef = db.collection('listings').doc(follower); 
        await docRef.update({ following: FieldValue.arrayUnion(newLikes) }); 
    
        res.status(200).send({ message: 'Successfully updated likes' });
    }catch (error){
        res.status(400).send({error: 'Error updating followers'})
    }
}