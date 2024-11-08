import { Alert } from "react-native";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/auth/firebaseConfig';

export const handleLike = async (
  docId: string,
  currentLikes: number,
  signedIn: boolean,
  setIsLiked: React.Dispatch<React.SetStateAction<boolean>>,
  setListings: React.Dispatch<React.SetStateAction<any[]>>,
  isLiked: boolean,
  router: any
) => {
  if (signedIn) {
    try {
      setIsLiked(!isLiked);
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
      const docRef = doc(db, 'listings', docId);
      
      await updateDoc(docRef, { likes: newLikes });

      // Update the local state to reflect the new like count
      setListings(prevListings =>
        prevListings.map(listing =>
          listing.id === docId ? { ...listing, likes: newLikes } : listing
        )
      );
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  } else {
    router.push('/(auth)/');
  }
};

export const handleComment = () => {
    // Handle comment logic
};

export const handleProfile = () => {
    // Handle profile logic
};

export const handleFollow = () => {
    // Handle follow logic
};

export const handlePurchase = () => {
    Alert.alert('purchase initiated')
}

export const handleOffer = () => {

}

