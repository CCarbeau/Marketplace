import { Alert } from "react-native";
import { ActiveUser, AuthContextProps, Listing } from "@/types/interfaces";
import { Router, useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;


//isLiked is whether the listing is liked at the time the function is called
export const handleLike = async (listingId: string, isLiked: boolean, profile: ActiveUser | null, router: Router, updateProfile: (updatedData: Partial<ActiveUser>) => void) => {
  if(profile){
    try{
      const data = {
        uid: profile.id,
        listingId: listingId,
        isLiked: isLiked,
      }

      const response = await fetch(`${API_URL}/user-input/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(data),
      })

      if(!response.ok){
        console.log('Error updating following');
      }

      let updatedLiked: string[]; 

      if(!isLiked && profile?.liked){
        updatedLiked = profile.liked.concat([listingId]);
        updateProfile({liked: updatedLiked})
      }else if (profile?.following){
        updatedLiked = profile.liked.filter(item => item !== listingId)
        updateProfile({liked: updatedLiked})
      }

      return true;
    }catch(error){
      console.error(error);
      return false;
    }
  }else{
    router.push('/(auth)/');
    return false;
  }

};

export const handleComment = () => {
    // Handle comment logic
};

export const handleProfile = (uid: string | undefined, router: Router, profile: ActiveUser | null) => {
  if(uid != profile?.id){
    router.push(`/other-profile/${uid}`);
  }else{
    router.push(`/profile`);
  }
};


// Following is whether the user follows the user at the time the function is called
export const handleFollow = async (followeeId: string | undefined, following: boolean, profile: ActiveUser | null, updateProfile: (updatedData: Partial<ActiveUser>) => void) => {

  if(followeeId){
    try{ 
      const data = {
        follower: profile?.id,
        followee: followeeId,
        following: following,
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
      
      let updatedFollowers: string[]; 

      if(!following && profile?.following){
        updatedFollowers = profile.following.concat([followeeId]);
        updateProfile({following: updatedFollowers})
      }else if (profile?.following){
        updatedFollowers = profile.following.filter(item => item !== followeeId)
        updateProfile({following: updatedFollowers})
      }

      return true;
    }catch(error){
      console.error('Error following user', error);
      return false;
    }
  } 

  return false;
};

export const handlePurchase = () => {
    Alert.alert('purchase initiated')
}

export const handleOffer = () => {

}

export const handleReport = () => {

}