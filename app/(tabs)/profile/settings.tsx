import { View, Text, Pressable, TextInput, Modal, Image, ImageBackground, Animated, Dimensions } from 'react-native'
import { styled } from 'nativewind';
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import icons from '../../../constants/icons';
import { signInWithEmailAndPassword } from 'firebase/auth';

const StyledPressable = styled(Pressable)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledImage = styled(Image)
const StyledSafeAreaView = styled(SafeAreaView)
const StyledTextInput = styled(TextInput)
const StyledImageBackground = styled(ImageBackground)

const API_URL = process.env.EXPO_PUBLIC_API_URL

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const settings = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState<String[]>([]);

  const [visible, setVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [interestModalVisible, setInterestModalVisible] = useState(false);
  
  return (
    <StyledView>

    </StyledView>
  );
}

export default settings