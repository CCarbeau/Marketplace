import { View, Text, Pressable, TextInput, Modal, Image, ImageBackground, Animated, Dimensions, ScrollView } from 'react-native'
import { styled } from 'nativewind';
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import icons from '../../../constants/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../../src/auth/firebaseConfig';
import { useAuth } from '../../../src/auth/AuthProvider';

const StyledPressable = styled(Pressable)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledImage = styled(Image)
const StyledSafeAreaView = styled(SafeAreaView)
const StyledTextInput = styled(TextInput)
const StyledImageBackground = styled(ImageBackground)

const API_URL = process.env.EXPO_PUBLIC_API_URL

const menu = () => {
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

  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/(tabs)/home/(tabs)/');
  };

  const RenderFinances = () => {
    return (
        <StyledView>
            
        </StyledView>
    )
  }

  const RenderBuying = () => {
    return (
        <StyledView>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.dollar} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Purchases</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.gavel} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Bids</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.handshake} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Offers</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.heartEmpty} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Likes</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
        </StyledView>
    )
  }

  const RenderAccount = () => {
    return (
        <StyledView>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.dollar} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Messages</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.gavel} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Change Email</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.handshake} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Change Password</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.heartEmpty} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Addresses</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.heartEmpty} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Delete Account</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
        </StyledView>
    )
  }

  const RenderLegal = () => {
    return (
        <StyledView>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.dollar} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Privacy Policy</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.gavel} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Terms & Conditions</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.handshake} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Contact Us</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.heartEmpty} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>FAQ</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
        </StyledView>
    )
  }
  
  return (
    <StyledView className="flex-1 w-full bg-white rounded-2xl">
        <ScrollView
            nestedScrollEnabled={true} 
            showsVerticalScrollIndicator={false}
        >
            <StyledView className='w-full bg-white mt-4'>
                <StyledView className='mr-2 ml-2 bg-white mt-2'>
                    <StyledText className='text-lg text-darkGray font-bold'>Finances</StyledText>
                    <RenderFinances/>
                </StyledView>
                <StyledView className='w-full h-1 bg-lightGray mt-2'/>
                <StyledView className='mr-2 ml-2 bg-white mt-2'>
                    <StyledText className='text-lg text-darkGray font-bold'>Buying</StyledText>
                    <RenderBuying/>
                </StyledView>
                <StyledView className='w-full h-1 bg-lightGray mt-2'/>
                <StyledView className='mr-2 ml-2 bg-white mt-2'>
                    <StyledText className='text-lg text-darkGray font-bold'>Account</StyledText>
                    <RenderAccount/>
                </StyledView>
                <StyledView className='w-full h-1 bg-lightGray mt-2'/>
                <StyledView className='mr-2 ml-2 bg-white mt-2'>
                    <StyledText className='text-lg text-darkGray font-bold'>Legal</StyledText>
                    <RenderLegal/>
                </StyledView>
                <StyledView className='w-full h-1 bg-lightGray mt-2'/>
                <StyledPressable onPress={handleSignOut} className='self-center bg-primary p-4 rounded-xl mt-4'>
                    <StyledText className='font-bold text-white'>Sign Out</StyledText>
                </StyledPressable>
                <StyledView className='w-full h-32 bg-white'/>
            </StyledView>
        </ScrollView>
    </StyledView>
  );
}

export default menu