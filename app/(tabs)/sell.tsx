import { View, Text, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styled } from 'nativewind'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const sell = () => {
  const router = useRouter();
  const StyledPressable = styled(Pressable)
  const StyledView = styled(View)
  const StyledText = styled(Text)
  const StyledSafeAreaView = styled(SafeAreaView)
  
  const auth = getAuth();

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
      <StyledView>
        <StyledText>Sign in</StyledText>
      </StyledView>
    )
  }

  return (
    <StyledSafeAreaView className='mt-16'>
      <StyledPressable onPress={() => {router.push('createListing')}}>
        <Text>Create Listing</Text>
      </StyledPressable>
    </StyledSafeAreaView>
  )
}

export default sell