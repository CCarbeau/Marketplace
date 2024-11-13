import { Alert } from "react-native";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/auth/firebaseConfig';
import { AuthContextProps, Listing } from "@/types/interfaces";
import { AuthContext } from '@/src/auth/AuthContext';
import { useContext } from "react";
import { JumpingTransition } from "react-native-reanimated";
import { json } from "stream/consumers";

const API_URL = process.env.EXPO_PUBLIC_API_URL;


// Need to remake to be similar to followers where it is an array of liked posts that 
// are stored for each user 
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

      const data = {
        id: docId,
        newLikes: newLikes,
      }

      const response = await fetch(`${API_URL}/user-input/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(data),
      })

      if (!response.ok){
        console.log('Error updating likes');
        setIsLiked(isLiked);
      }else{
        if(setListings){
          setListings(prevListings =>
            prevListings.map(listing =>
              listing.id === docId ? { ...listing, likes: newLikes } : listing
            )
          );
        }else if(setListing){
          setListing((prevListing) => prevListing ? { ...prevListing, likes: newLikes } : null);
        }
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      setIsLiked(isLiked);
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
    const data = {
      follower: profile?.id,
      followee: followeeId,
    }

    const response = await fetch(`${API_URL}/user-input/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(data),
    })

    if(!response.ok){
      console.log('Error updating following');
    }
    
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