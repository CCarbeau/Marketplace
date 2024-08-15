import { View, Text, Pressable, TextInput, Alert } from 'react-native'
import { styled } from 'nativewind';
import React, { useState, useEffect } from 'react'
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const signIn = () => {
  const StyledPressable = styled(Pressable)
  const StyledView = styled(View)
  const StyledText = styled(Text)
  const StyledSafeAreaView = styled(SafeAreaView)
  const StyledTextInput = styled(TextInput)

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
      router.back()
    } catch (err:any) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={{marginTop:64}}>
      <Pressable onPress={() => {router.replace('/home')}}>
        <StyledText>Back</StyledText>
      </Pressable>
      <TextInput
        style={{
          height: 40,
          borderColor: 'grey', 
          borderWidth: 2,
          marginBottom: 80, 
          paddingLeft: 8 
        }}
        placeholder="Enter email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={{
          height: 40, 
          borderColor: 'grey',
          borderWidth: 2,
          marginBottom: 80, 
          paddingLeft: 8 
        }}
        placeholder="Enter password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        autoCapitalize="none"
      />
      <StyledPressable className='border-2 h-16 border-black' onPress={handleSignIn}>
        <StyledText className='text-black'>Sign In</StyledText>
      </StyledPressable>
      <StyledPressable onPress={() => {router.replace('signUp')}}>
        <Text>Need to create an account? Sign up here!</Text>
      </StyledPressable>
    </SafeAreaView>
  );
}

export default signIn