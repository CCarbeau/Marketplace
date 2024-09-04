import { View, Text, Pressable, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styled } from 'nativewind'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import sellerExample from '../../../assets/images/sellerExample.png'

const StyledPressable = styled(Pressable)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledSafeAreaView = styled(SafeAreaView)
const StyledImage = styled(Image)

const sell = () => {
  const auth = getAuth();
  const router = useRouter();

  const [loading,setLoading]=useState(true)

  const [user, setUser] = useState<User | null>(null); // `User` is the Firebase User type or null

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [auth]);

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
          <StyledPressable onPress={() => { router.push('/signIn') }} className='flex justify-center bg-primary flex-1 mr-4 ml-4 rounded-full'>
            <StyledText className='text-white text-center font-bold text-3xl p-2'>Sign In</StyledText>
          </StyledPressable>

          <StyledPressable onPress={() => { router.push('/signUp') }} className='flex justify-center flex-1 ml-4 mr-4 mt-4 rounded-full border-2 border-black'>
            <StyledText className='text-black text-center font-bold text-3xl p-2'>Sign Up</StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>
    )
  }

  return (
    <StyledSafeAreaView className='mt-16'>
      <StyledPressable onPress={() => {router.push('/(tabs)/sell/createListing')}}>
        <Text>Create Listing</Text>
      </StyledPressable>
    </StyledSafeAreaView>
  )
}

export default sell