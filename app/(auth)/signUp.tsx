import { View, Text, Pressable, TextInput, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);

type ErrorType = Error | null;

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ErrorType>(null);

  const router = useRouter();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', userCredential.user);
      Alert.alert('Success', 'User account created successfully!');
      router.back()
    } catch (error) {
      // Ensure that error is of type Error
      if (error instanceof Error) {
        console.error('Error signing up:', error);
        setError(error); // Set the error state
        Alert.alert('Error', error.message);
      } else {
        // Handle unexpected error types
        console.error('Unexpected error:', error);
        setError(new Error('An unexpected error occurred'));
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };

  return (
    <SafeAreaView style={{marginTop:64}}>
      <Pressable onPress={() => {router.replace('/home')}}>
        <StyledText>Back</StyledText>
      </Pressable>
      <TextInput
        style={{
          height: 40, // 2.5rem = 40px
          borderColor: 'grey', // Assuming grey color
          borderWidth: 2,
          marginBottom: 80, // 5rem = 80px
          paddingLeft: 8 // 0.5rem = 8px
        }}
        placeholder="Enter email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
        }}
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
        onChangeText={(text) => {setPassword(text)}} 
        secureTextEntry
        autoCapitalize="none"
      />
      <StyledPressable className='border-2 h-16 border-black' onPress={handleSignUp}>
        <StyledText className='text-black'>Sign Up</StyledText>
      </StyledPressable>
      {error && <StyledText className='text-red mt-4'>{error.message}</StyledText>}
    </SafeAreaView>
  );
}

export default SignIn;