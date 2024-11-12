import { View, Text, Pressable, Image, ScrollView } from 'react-native'
import { styled } from 'nativewind';
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router';
import icons from '../../../constants/icons';
import { useAuth } from '../../../src/auth/AuthContext';

const StyledPressable = styled(Pressable)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledImage = styled(Image)

const API_URL = process.env.EXPO_PUBLIC_API_URL

// Types of notifications: gain follower, outbid, item sold, your item bid on, win an item, 
// bid on item ending soon, your auction ends, receive a review, funds available from a sale,
// receive a message, recieve a like on a listing, purchased item shipping update

const menu = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { user } = useAuth();
  
  return (
    <StyledView className="flex-1 w-full" style={{backgroundColor: '#FFFFFF'}}>
        <StyledView className='absolute h-24 w-full z-10' style={{backgroundColor: '#FFFFFF'}}>
            <StyledView className='absolute bottom-2 w-full flex-row items-center justify-center'>
                <StyledText className='text-lg text-md font-bold text-black'>Notifications</StyledText>
                <StyledPressable className='absolute right-2' onPress={router.back}>
                    <StyledImage source={icons.carrotBlack} className='w-5 h-5' style={{tintColor:'#FF5757', transform:[{rotate:'270deg'}]}} />
                </StyledPressable>
            </StyledView>
            <StyledView className='absolute bottom-0 w-full h-px bg-darkWhite'/>
        </StyledView>
        <StyledView className='w-full h-24' style={{backgroundColor:'#FFFFFF'}} />
        <ScrollView
            nestedScrollEnabled={true} 
            showsVerticalScrollIndicator={false}
        >
            <StyledView className='w-full pt-4' style={{backgroundColor: '#FFFFFF'}}>
                
                <StyledView className='w-full h-32'/>
            </StyledView>
        </ScrollView>
    </StyledView>
  );
}

export default menu