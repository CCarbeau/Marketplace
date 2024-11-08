import { View, Text, Pressable, TextInput, Modal, Image, ImageBackground, Animated, Dimensions } from 'react-native'
import { styled } from 'nativewind';
import React, { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import icons from '../../constants/icons';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import InterestModal from './interest';
import AsyncStorage from '@react-native-async-storage/async-storage';



const StyledPressable = styled(Pressable)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledImage = styled(Image)
const StyledSafeAreaView = styled(SafeAreaView)
const StyledTextInput = styled(TextInput)
const StyledImageBackground = styled(ImageBackground)

const images = [
  require('../../assets/images/julio.png'),
  require('../../assets/images/volpe.jpg'),
  require('../../assets/images/gunnar.jpg')
];

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const signIn = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [visible, setVisible] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false); // Tracks the current screen: Sign In or Sign Up
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedSignUp = useRef(new Animated.Value(0)).current;

  // Automatically switch images at a set interval (e.g., every 3 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        slideshowAnimation.setValue(screenWidth); // Reset position for the next animation
      },0); // delay between slide animations
    }, 5000); 

    return () => clearInterval(intervalId);
  }, []);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optionally store the user's token or UID in AsyncStorage for future use
      const idToken = await user.getIdToken();
      await AsyncStorage.setItem('userToken', idToken);

      setError(null);
      router.back()
    } catch (err:any) {
      setError(err.message);
    }
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideshowAnimation = useRef(new Animated.Value(screenWidth)).current;

  const handleSlide = (toSignUp: boolean) => {
    Animated.timing(animatedValue, {
      toValue: toSignUp ? -screenWidth : 0, // Slide to the left or back to the right
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSignUp(toSignUp)); // After the animation, update state
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [interests, setInterests] = useState<String[]>([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [interestModalVisible, setInterestModalVisible] = useState(false);
  const auth = getAuth(); 

  const pages = [0, 1, 2, 3];

  const handleSignUp = async () => {
    try {
      const response = await fetch(`${API_URL}/register-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          username: username,
          password: password,
          interests: interests
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);

        setVisible(false);
        router.push('/(tabs)/home');

      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  const handleScroll = (pageIndex: number) => {
    Animated.timing(animatedSignUp, {
      toValue: -pageIndex * screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(pageIndex);
    });
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      handleScroll(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      handleScroll(currentPage - 1);
    }
  };

  const renderDots = () => {
    return (
      <StyledView className="absolute inset-x-0 flex-row justify-center -bottom-2">
        {pages.map((_, index) => (
          <StyledView
            key={index}
            className={`w-2.5 h-2.5 mx-1 rounded-full ${
              currentPage === index ? 'bg-primary' : 'bg-gray'
            }`}
          />
        ))}
      </StyledView>
    );
  };

  const handleInterestsSelect = (interests: string[]) => {
    setInterests(interests);
  }

  return (
    <StyledImageBackground source={images[currentImageIndex]} className='h-4/5'>
      <Modal animationType='slide' transparent={true} visible={visible}>
        <StyledView className='flex-1 bg-opacity-50 justify-end'>
          <StyledView className='h-2/5 focus:h-4/5 w-full bg-white rounded-2xl shadow-black shadow-xl overflow-hidden'>
            <Animated.View
              style={{
                flexDirection: 'row',
                width: screenWidth * 2, // Width for two screens
                transform: [{ translateX: animatedValue }], // Slide effect
              }}
            >
              {/* Sign In Screen */}
              <StyledView style={{ width: screenWidth }} className='h-full mt-4'>
                <StyledView className='flex-row items-center justify-center'>
                  <StyledPressable className='absolute left-4' onPress={() => { router.back(); }}>
                    <StyledImage className='w-5 h-5' source={icons.carrotBlack} style={{ transform: [{ rotate: '90deg' }] }} />
                  </StyledPressable>
                  <StyledText className='text-2xl font-bold'>Welcome Back!</StyledText>
                </StyledView>
                <StyledView className='h-px bg-gray w-full mt-2'/>
                <StyledView className='ml-4 mr-4'>
                  <StyledTextInput
                    className='border border-gray rounded-xl w-full text-xl text-primary mt-2 p-2 focus:border-primary'
                    placeholder='Email Address'
                    placeholderTextColor='gray'
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <StyledTextInput
                    className='border border-gray rounded-xl w-full text-xl text-black mt-2 p-2 focus:border-primary'
                    placeholder='Password'
                    placeholderTextColor='gray'
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry
                    textAlignVertical='center'
                    autoCapitalize="none"
                  />
                  <StyledPressable className='mt-2 mb-2 flex-row' onPress={() => handleSlide(true)}>
                    <StyledText className='text-gray'>Need to create an account? </StyledText>
                    <StyledText className='text-primary font-bold text-md'>Sign up here!</StyledText>
                  </StyledPressable>
                  <StyledPressable className='flex justify-center mt-16 h-12 bg-primary rounded-xl active:bg-primaryDark' onPress={handleSignIn}>
                    <StyledText className='text-white text-2xl font-bold text-center'>Sign In</StyledText>
                  </StyledPressable>
                </StyledView>
              </StyledView>

              {/* Sign Up Screen */}
              <StyledView className='flex-1 bg-opacity-50 justify-end'>
                <StyledView className='flex-row items-center justify-center mt-4'>
                  <StyledPressable className='absolute left-4 active:bg-gray rounded-full' onPress={() => handleSlide(false)}>
                    <StyledImage className='w-5 h-5' source={icons.carrotBlack} style={{ transform: [{ rotate: '90deg' }] }} />
                  </StyledPressable>
                  <StyledText className='text-2xl font-bold'>Sign Up</StyledText>
                </StyledView>
                <StyledView className='h-px bg-gray w-full mt-2'/>
                <Animated.View
                    style={{
                      flexDirection: 'row',
                      width: screenWidth * pages.length,
                      transform: [{ translateX: animatedSignUp }],
                      flex: 1,
                    }}
                  >
                    {pages.map((_, index) => (
                      <StyledView key={index} style={{ width: screenWidth}} className='pl-4 pr-4 mt-2 h-full'>
                        {index === 0 && (
                          <>
                            <StyledText className='text-xl font-bold'>Your Information</StyledText>
                            <StyledView className='flex-row justify-between mt-2'>
                              <StyledTextInput 
                                className='flex-1 border border-gray rounded-xl text-xl mr-2 text-primary p-2 h-12 focus:border-primary' 
                                placeholder='First Name' 
                                placeholderTextColor='gray'
                                value={firstName}
                                onChangeText={(text) => setFirstName(text)}
                              />
                              <StyledTextInput 
                                className='flex-1 border border-gray rounded-xl text-xl text-primary p-2 h-12 focus:border-primary' 
                                placeholder='Last Name' 
                                placeholderTextColor='gray'
                                value={lastName}
                                onChangeText={(text) => setLastName(text)}
                              />
                            </StyledView>
                            <StyledTextInput
                              className='border border-gray rounded-xl w-full text-xl text-primary mt-2 pl-2 h-12 focus:border-primary'
                              placeholder='Email Address'
                              placeholderTextColor='gray'
                              value={email}
                              onChangeText={(text) => setEmail(text)}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <StyledText className='text-xl font-bold'>Account Details</StyledText>
                            <StyledTextInput
                              className='border border-gray rounded-xl w-full text-xl text-primary pl-2 h-12 focus:border-primary'
                              placeholder='Username'
                              placeholderTextColor='gray'
                              value={username}
                              onChangeText={(text) => setUsername(text)}
                              autoCapitalize="none"
                            />
                            <StyledView className='flex-row items-center justify-between border border-gray rounded-xl pl-2 mt-2 w-full h-12 focus:border-primary'>
                              <StyledTextInput
                                className='text-xl text-black w-3/4'
                                placeholder='Password'
                                placeholderTextColor='gray'
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                textAlignVertical='center'
                                style={{ paddingVertical: 0 }}
                              />
                              <StyledPressable onPress={() => {setShowPassword(!showPassword)}}>
                                {showPassword?(
                                  <StyledImage source={icons.eyePass} className='w-8 h-8 mr-2'/>
                                ):(
                                  <StyledImage source={icons.eye} className='w-8 h-8 mr-2'/>
                                )}
                              </StyledPressable>
                            </StyledView>
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <StyledText className='text-xl font-bold'>What are you looking for?</StyledText>
                            <StyledPressable 
                              className='border border-gray rounded-xl w-full text-xl text-primary mt-2 p-2 active:border-primary'
                              onPress={() => {setInterestModalVisible(true); setVisible(false);}}  
                            >
                              {interests.length===0 ? (
                                <StyledText className='text-gray text-xl'>Select Interests</StyledText>
                              ):(
                                <StyledText className='text-primary text-xl'>{interests.join(', ')}</StyledText>
                              )}
                            </StyledPressable>
                          </>
                        )}
                        {index === 3 && (
                          <>
                            <StyledView className='flex w-full h-full'>
                              <StyledView className='justify-center items-center'>
                                <StyledPressable className='w-full p-2 bg-primary rounded-xl active:bg-primaryDark mt-4' onPress={() => {router.push('/(auth)/sellerSignUp'); setVisible(false);}}>
                                  <StyledText className='text-white text-2xl font-bold text-center'>Provide Seller Details</StyledText>
                                </StyledPressable>
                                <StyledText className='text-gray text-md mt-1'>*We need additional details before you can sell items</StyledText>
                                <StyledPressable className='w-full p-2 border border-black rounded-xl active:bg-gray mt-4' onPress={() => {handleSignUp;}}>
                                  <StyledText className='text-black text-2xl font-bold text-center'>Create Account</StyledText>
                                </StyledPressable>
                              </StyledView>
                            </StyledView>
                          </>
                        )}
                        <StyledView className="absolute left-4 right-4 bottom-4 flex-row justify-between gap-x-2 items-center">
                          {(index > 0) && (
                            <StyledPressable className='flex-1 basis-1/3 mt-12 p-2 bg-gray rounded-xl active:bg-darkGray' onPress={handlePrevious}>
                              <StyledText className="text-white text-xl font-bold text-center">Back</StyledText>
                            </StyledPressable>
                          )}
                          {index < pages.length - 1 ? (
                            <StyledPressable className='flex-1 basis-2/3 mt-12 p-2 bg-primary rounded-xl active:bg-primaryDark' onPress={handleNext}>
                              <StyledText className='text-white text-xl font-bold text-center'>Next</StyledText>
                            </StyledPressable>
                          ) : (
                            <></>
                          )}
                        </StyledView>
                      </StyledView>
                    ))}
                  </Animated.View>
                {renderDots()}
              </StyledView>
            </Animated.View>
          </StyledView>
        </StyledView>
      </Modal>
      <InterestModal 
        visible = {interestModalVisible}
        onClose={() => {setInterestModalVisible(false); setVisible(true);}}
        onSelectInterests={(interests: string[]) => {handleInterestsSelect(interests)}}
      />
    </StyledImageBackground>
  );
}

export default signIn