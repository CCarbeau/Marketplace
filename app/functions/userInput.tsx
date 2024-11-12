import { Alert } from "react-native";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/auth/firebaseConfig';
import { AuthContextProps, Listing } from "@/types/interfaces";
import { AuthContext } from '@/src/auth/AuthContext';
import { useContext } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const handleLike = async (
  docId: string,
  currentLikes: number,
  signedIn: boolean,
  setIsLiked: React.Dispatch<React.SetStateAction<boolean>>,
  setListings: React.Dispatch<React.SetStateAction<any[]>> | null,
  setListing: React.Dispatch<React.SetStateAction<Listing | null>> | null,
  isLiked: boolean,
  router: any
) => {
  if (signedIn) {
    try {
      setIsLiked(!isLiked);
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
      const docRef = doc(db, 'listings', docId);
      
      await updateDoc(docRef, { likes: newLikes });

      if(setListings){
        // Update the local state to reflect the new like count
        setListings(prevListings =>
          prevListings.map(listing =>
            listing.id === docId ? { ...listing, likes: newLikes } : listing
          )
        );
      }else if(setListing){

      }
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

export const handleFollow = async (followeeId: string) => {
  const { profile } = useContext(AuthContext) as AuthContextProps; 

  try{ 
    const response = await fetch(`${API_URL}/user-input/follow`, {
      method: 'POST',

    })
  }catch(error){
    console.error('Error following user', error);
  }
};

export const handlePurchase = () => {
    Alert.alert('purchase initiated')
}

export const handleOffer = () => {

}

export const handleReport = () => {

}