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
        <StyledView className='w-full'>
            <StyledView className='border border-darkGray bg-darkWhite rounded-xl p-2 shadow-sm shadow-gray'>
                <StyledPressable className='h-24 flex-row justify-between p-2 mb-2 rounded-xl'>
                    <StyledView>
                        <StyledText className='text-3xl font-bold text-primary'>$XXXX.XX</StyledText>
                        <StyledText className='text-md'>Available Funds</StyledText>
                    </StyledView>
                    <StyledView className='justify-center'>
                        <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
                    </StyledView>
                </StyledPressable>
                <StyledView className='w-full flex-row'>
                    <StyledPressable className='flex-1 border rounded-xl bg-white active:bg-lightGray p-2 items-center'>
                        <StyledText className='font-bold'>Transfer</StyledText>
                    </StyledPressable>
                    <StyledPressable className='flex-1 bg-primary rounded-xl active:bg-primaryDark p-2 ml-2 items-center'>
                        <StyledText className='text-white font-bold'>Add Funds</StyledText>
                    </StyledPressable>
                </StyledView>
            </StyledView>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.creditCard} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Payment Methods</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.transactions} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Transactions</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
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
                        <StyledImage source={icons.message} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Messages</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.email} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Change Email</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.lock} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Change Password</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.pin} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Addresses</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.trash} style={{tintColor:'#FF0000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold text-red-500'>Delete Account</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{tintColor:'#FF0000', transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
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
                        <StyledImage source={icons.lock} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Privacy Policy</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.terms} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Terms & Conditions</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.message} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Contact Us</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
            <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center'>
                        <StyledImage source={icons.question} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>FAQ</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
            </StyledPressable>
        </StyledView>
    )
  }
  
  return (
    <StyledView className="flex-1 w-full" style={{backgroundColor: '#FFFFFF'}}>
        <ScrollView
            nestedScrollEnabled={true} 
            showsVerticalScrollIndicator={false}
        >
            <StyledView className='w-full pt-4' style={{backgroundColor: '#FFFFFF'}}>
                <StyledView className='pr-2 pl-2 pt-4'>
                    <RenderFinances/>
                </StyledView>
                <StyledView className='w-full h-1 bg-darkerWhite mt-2'/>
                <StyledView className='mr-2 ml-2 mt-2'>
                    <StyledText className='text-lg text-darkGray font-bold'>Buying</StyledText>
                    <RenderBuying/>
                </StyledView>
                <StyledView className='w-full h-1 bg-darkerWhite mt-2'/>
                <StyledView className='mr-2 ml-2 mt-2'>
                    <StyledText className='text-lg text-darkGray font-bold'>Account</StyledText>
                    <RenderAccount/>
                </StyledView>
                <StyledView className='w-full h-1 bg-darkerWhite mt-2'/>
                <StyledView className='mr-2 ml-2 mt-2'>
                    <StyledText className='text-lg text-darkGray font-bold'>Legal</StyledText>
                    <RenderLegal/>
                </StyledView>
                <StyledView className='w-full h-1 bg-darkerWhite mt-2'/>
                <StyledPressable onPress={handleSignOut} className='self-center bg-primary p-3 rounded-xl mt-4 w-5/6 items-center'>
                    <StyledText className='font-bold text-white'>Sign Out</StyledText>
                </StyledPressable>
                <StyledView className='w-full h-32'/>
            </StyledView>
        </ScrollView>
    </StyledView>
  );
}

export default menu