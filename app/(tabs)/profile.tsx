import { View, Text, Pressable, Alert } from 'react-native';
import { styled } from 'nativewind';
import React, { useState, useEffect } from 'react';
import { signOut, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router';

const Profile = () => {
  const StyledPressable = styled(Pressable);
  const StyledText = styled(Text);
  const StyledView = styled(View)
  
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
      <StyledPressable onPress={()=>{router.push('/signIn')}} className="mt-16">
        <StyledText>Sign In</StyledText>
      </StyledPressable>
    )
  }

  return (
    <StyledPressable onPress={handleSignOut} className="mt-16">
        <StyledText>Sign Out</StyledText>
      </StyledPressable>
  )
};

export default Profile;