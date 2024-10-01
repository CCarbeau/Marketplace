import { View, Text, Pressable, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import React, { useState, useEffect } from 'react';
import { signOut, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, useUnstableGlobalHref } from 'expo-router';

import profileExample from '../../assets/images/profileExample.png'
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledView = styled(View)
const StyledImage = styled(Image)

const Profile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const auth = getAuth();
  
  useEffect(() => {
    // Listen for changes in the user's auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {

        // Optionally, store the user's ID token in AsyncStorage if needed for backend API requests
        const idToken = await user.getIdToken();
        await AsyncStorage.setItem('userToken', idToken);

        setSignedIn(true); // Update the local state to reflect that the user is signed in
      } else {
        // No user is signed in
        setSignedIn(false); // Update the state to reflect that the user is not signed in
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'You have been signed out.');
      await AsyncStorage.removeItem('userToken');
      setSignedIn(false);
      router.replace('/(tabs)/home'); // Redirect to sign-in page after signing out
    } catch (error) {
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };
  
  if(!signedIn){
    return (
      <StyledView className='flex-1 w-full h-full'>
        <StyledView className='flex mt-16 h-96'>
          <StyledImage
            source={profileExample}
            className='h-full w-full'
          />
        </StyledView>
        <StyledView className='w-full h-48 mt-4'>
          <StyledText className='text-4xl font-bold pl-4 pr-4 mt-2'>Social Media Feel</StyledText>
          <StyledText className='pl-4 pr-4'>Customize your profile, post your listings, and build an audience. Sell your cards faster using Hobby.</StyledText>
        </StyledView>
        <StyledView className='flex absolute w-full h-32 bottom-12'>
          <StyledImage />
          <StyledPressable onPress={() => { router.push('/(auth)/') }} className='flex justify-center bg-primary flex-1 mr-4 ml-4 rounded-full'>
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
    <StyledPressable onPress={handleSignOut} className="mt-16">
      <StyledText>Sign Out</StyledText>
    </StyledPressable>
  )
};

export default Profile;