import { auth, db } from '../config/firebaseAdminConfig.js';
import { FieldValue} from 'firebase-admin/firestore';

export const like = async (req, res) => {
    try {
      const { uid, listingId, isLike } = req.body;
  
      if (!uid || !listingId || !isLike === undefined) {
        return res.status(400).send({ error: 'Missing uid or listingId or isLiked parameter' });
      }
  
      const docRef = db.collection('listings').doc(listingId); 
      const userDocRef = db.collection('userData').doc(uid);

      if(isLike){
        await userDocRef.update({liked: FieldValue.arrayUnion(listingId)})
        await docRef.update({ likes: FieldValue.increment(1) }); 
      }else{
        await userDocRef.update({liked: FieldValue.arrayRemove(listingId)})
        await docRef.update({ likes: FieldValue.increment(-1) }); 
      }
  
      res.status(200).send({ message: 'Successfully updated likes' });
    } catch (error) {
      console.error('Error updating likes:', error);
      res.status(400).send({ error: 'Failed to handle like' });
    }
  };

export const follow = async (req, res) => {
    try{
        const { follower, followee, following } = req.body;

        if(!follower || !followee ||  typeof following === 'undefined'){
          return res.status(400).send({ error: 'Missing parameters' });
        }

        
        const docRef = db.collection('userData').doc(follower); 
        if(!following){
          await docRef.update({ following: FieldValue.arrayUnion(followee) }); 
        }else{
          await docRef.update({ following: FieldValue.arrayRemove(followee) }); 
        }
        
    
        res.status(200).send({ message: 'Successfully updated likes' });
    }catch (error){
        res.status(400).send({error: 'Error updating followers'})
    }
}