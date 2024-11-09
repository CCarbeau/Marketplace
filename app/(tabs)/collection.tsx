import { View, Text, Image, Pressable } from 'react-native'
import { styled } from 'nativewind'
import React, { useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router'

import collectionExample from '../../assets/images/collectionExample.png'
import { AuthContext } from '@/src/auth/AuthContext';
import { AuthContextProps } from '@/types/interfaces';

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)

const collection = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext) as AuthContextProps;

  const [loading, setLoading]=useState(true);
  
  

  if(!user){
    return (
      <StyledView className='flex-1 w-full h-full'>
        <StyledView className='flex mt-16 h-96'>
          <StyledImage
            source={collectionExample}
            className='h-full w-full border'
          />
        </StyledView>
        <StyledView className='w-full h-48 mt-4'>
          <StyledText className='text-4xl font-bold pl-4 pr-4 mt-2'>Track Your Collection</StyledText>
          <StyledText className='pl-4 pr-4'>Track how your collection stacks up against the rest of our users. We automatically add cards you buy or sell on Hobby to your collection.</StyledText>
        </StyledView>
        <StyledView className='flex absolute w-full h-32 bottom-12'>
          <StyledImage />
          <StyledPressable onPress={() => { router.push('/(auth)') }} className='flex justify-center bg-primary flex-1 mr-4 ml-4 rounded-full'>
            <StyledText className='text-white text-center font-bold text-3xl p-2'>Sign In</StyledText>
          </StyledPressable>

          <StyledPressable onPress={() => { router.push('/(auth)/signUp') }} className='flex justify-center flex-1 ml-4 mr-4 mt-4 rounded-full border-2 border-black'>
            <StyledText className='text-black text-center font-bold text-3xl p-2'>Sign Up</StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>
    )
  }
  return (
    <StyledView>
      <StyledText>collection</StyledText>
    </StyledView>
  )
}

export default collection