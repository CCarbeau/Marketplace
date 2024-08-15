import { View, Text, Image, Pressable } from 'react-native'
import { styled } from 'nativewind'
import React, { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'expo-router'

const collection = () => {
  const StyledPressable = styled(Pressable)
  const StyledImage = styled(Image)
  const StyledView = styled(View)
  const StyledText = styled(Text)

  const router = useRouter();
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
    <StyledView>
      <StyledText>collection</StyledText>
    </StyledView>
  )
}

export default collection