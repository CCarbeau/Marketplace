import { View, Text, Pressable, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import React, { useState, useEffect } from 'react';
import { signOut, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router';

import profileExample from '../../assets/images/profileExample.png'

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledView = styled(View)
const StyledImage = styled(Image)

const Profile = () => {
  const auth = getAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null); // `User` is the Firebase User type or null

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'You have been signed out.');
      router.replace('home'); // Redirect to sign-in page after signing out
    } catch (error) {
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    // Optionally render a loading spinner or message while checking auth state
    return <StyledText>Loading...</StyledText>;
  }
  
  if(!user){
    return (
      <StyledView className='flex-1 w-full h-full'>
        <StyledView className='flex mt-16 h-96'>
          <StyledImage
            source={profileExample}
            className='h-full w-full'
          />
        </StyledView>
        <StyledView className='w-full h-48 mt-4'>
          <StyledText className='text-4xl font-bold pl-4 pr-4 mt-2'>A Social Media Feel</StyledText>
          <StyledText className='pl-4 pr-4'>Customize your profile, post your listings, and build an audience. Sell your cards faster using Hobby.</StyledText>
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
    <StyledPressable onPress={handleSignOut} className="mt-16">
      <StyledText>Sign Out</StyledText>
    </StyledPressable>
  )
};

export default Profile;