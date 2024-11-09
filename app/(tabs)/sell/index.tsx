import { View, Text, Pressable, Image } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { styled } from 'nativewind'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { AuthContext } from '../../../src/auth/AuthContext';
import { AuthContextProps } from '@/types/interfaces'

import sellerExample from '../../../assets/images/sellerExample.png';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/auth/firebaseConfig';

const StyledPressable = styled(Pressable)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledSafeAreaView = styled(SafeAreaView)
const StyledImage = styled(Image)

const sell = () => {
  const router = useRouter();

  const { user } = useContext(AuthContext) as AuthContextProps;

  const [isSeller, setIsSeller] = useState(false);

  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'userData', user.uid));
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsSeller(userData.seller); // Access seller status
        }
      }
    };

    fetchUserProfile();
  },[user]);

  if(!user){
    return (
      <StyledView className='flex-1 w-full h-full'>
        <StyledView className='flex mt-16 h-96'>
          <StyledImage
            source={sellerExample}
            className='h-full w-full border'
          />
        </StyledView>
        <StyledView className='w-full h-48 mt-4'>
          <StyledText className='text-4xl font-bold pl-4 pr-4 mt-2'>No Seller Fees</StyledText>
          <StyledText className='pl-4 pr-4'>We have 0% seller fees, no strings attached. Expand profit margins and sell cards faster by using Hobby.</StyledText>
        </StyledView>
        <StyledView className='flex absolute w-full h-32 bottom-12'>
          <StyledImage />
          <StyledPressable onPress={() => { router.push('/(auth)') }} className='flex justify-center bg-primary flex-1 mr-4 ml-4 rounded-full active:bg-primaryDark'>
            <StyledText className='text-white text-center font-bold text-3xl p-2'>Sign In</StyledText>
          </StyledPressable>

          <StyledPressable onPress={() => { router.push('/signUp') }} className='flex justify-center flex-1 ml-4 mr-4 mt-4 rounded-full border-2 border-black active:bg-darkGray'>
            <StyledText className='text-black text-center font-bold text-3xl p-2'>Sign Up</StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>
    )
  }

  return (
    <StyledSafeAreaView className='mt-16'>
      {isSeller ? (
        <StyledPressable onPress={() => {router.push('/(tabs)/sell/createListing')}}>
          <Text>Create Listing</Text>
        </StyledPressable>
      ):(
      <StyledPressable onPress={() => {router.push('/(auth)/sellerSignUp')}}>
        <Text>Become a Seller</Text>
      </StyledPressable>
      )}   
    </StyledSafeAreaView>
  )
}

export default sell