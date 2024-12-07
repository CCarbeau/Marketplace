import { View, Text, Pressable, Image, ScrollView } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { styled } from 'nativewind'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { AuthContext } from '../../../src/auth/AuthContext';
import { AuthContextProps } from '@/types/interfaces'
import icons from '../../../constants/icons';
import sellerExample from '../../../assets/images/sellerExample.png';

const StyledPressable = styled(Pressable)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledSafeAreaView = styled(SafeAreaView)
const StyledImage = styled(Image)

const sell = () => {
  const router = useRouter();

  const { user, profile, updateProfile } = useContext(AuthContext) as AuthContextProps; 

  if(!user){
    return (
      <StyledView className='flex-1 w-full h-full'>
        <StyledView className='flex mt-16 h-96'>
          <StyledImage
            source={sellerExample}
            className='h-full w-full border'
          />
        </StyledView>
        <StyledView className='w-full h-48 mt-4'>
          <StyledText className='text-4xl font-bold pl-4 pr-4 mt-2'>No Seller Fees</StyledText>
          <StyledText className='pl-4 pr-4'>We have 0% seller fees, no strings attached. Expand profit margins and sell cards faster by using Hobby.</StyledText>
        </StyledView>
        <StyledView className='flex absolute w-full h-32 bottom-12'>
          <StyledImage />
          <StyledPressable onPress={() => { router.push('/(auth)') }} className='flex justify-center bg-primary flex-1 mr-4 ml-4 rounded-full active:bg-primaryDark'>
            <StyledText className='text-white text-center font-bold text-3xl p-2'>Sign In</StyledText>
          </StyledPressable>

          <StyledPressable onPress={() => { router.push('/signUp') }} className='flex justify-center flex-1 ml-4 mr-4 mt-4 rounded-full border-2 border-black active:bg-darkGray'>
            <StyledText className='text-black text-center font-bold text-3xl p-2'>Sign Up</StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>
    )
  }

  return (
    <>
      <ScrollView>
        <StyledSafeAreaView className='flex-1'>
          <StyledView className='h-[344] mr-2 ml-2 mt-4 bg-lightGray rounded-xl'>
            <StyledView className='pl-4 pr-4 pt-4'>
              <StyledText className='font-bold text-darkGray'>Sold This Week</StyledText>
              <StyledText className='font-bold text-3xl'>$XXXX.XX</StyledText>
              <StyledText className='text-darkGray mt-1'>Weekly Change:</StyledText>
              <StyledText className='text-green-600 font-bold'>+1042.24 (124%)</StyledText>
            </StyledView>
            <StyledView className='h-1/2 mr-2 ml-2 -mt-1 items-center'>  
              <StyledView className='w-11/12'>
                <StyledView className='flex-row justify-evenly items-end mt-2'>
                  <StyledPressable className='w-6 h-2 bg-primary' />
                  <StyledPressable className='w-6 h-8 bg-primary' />
                  <StyledPressable className='w-6 h-16 bg-primary' />
                  <StyledPressable className='w-6 h-4 bg-primary' />
                  <StyledPressable className='w-6 h-2 bg-primary' />
                  <StyledPressable className='w-6 h-24 bg-primary' />
                  <StyledPressable className='w-6 h-12 bg-primary' />
                </StyledView>
                <StyledView className='h-px w-full bg-darkGray'/>
                <StyledView className='flex-row justify-evenly mt-2'>
                  <StyledText className='font-bold text-darkGray w-6 text-center'>S</StyledText>
                  <StyledText className='font-bold text-darkGray w-6 text-center'>M</StyledText>
                  <StyledText className='font-bold text-darkGray w-6 text-center'>T</StyledText>
                  <StyledText className='font-bold text-darkGray w-6 text-center'>W</StyledText>
                  <StyledText className='font-bold text-darkGray w-6 text-center'>T</StyledText>
                  <StyledText className='font-bold text-darkGray w-6 text-center'>F</StyledText>
                  <StyledText className='font-bold text-darkGray w-6 text-center'>S</StyledText>
                </StyledView>
                <StyledView className='mt-4'>
                  <StyledText className='font-bold'>Largest Sales</StyledText>
                  <StyledView className='flex-row'>
                    <StyledView className='w-3/4 overflow-hidden'>
                      <StyledView className='mt-1 flex-row'>
                        <StyledText className='w-4'>1)</StyledText>
                        <StyledText numberOfLines={1} className='text-darkGray ml-2'>Anthony Volpe Bowman 1st Auto PSA 10</StyledText>
                      </StyledView>
                      <StyledView className='mt-1 flex-row'>
                        <StyledText className='w-4'>2)</StyledText>
                        <StyledText numberOfLines={1} className='text-darkGray ml-2'>Anthony Volpe Bowman 1st Auto PSA 10</StyledText>
                      </StyledView>
                      <StyledView className='mt-1 flex-row'>
                        <StyledText className='w-4'>3)</StyledText>
                        <StyledText numberOfLines={1} className='text-darkGray ml-2'>Anthony Volpe Bowman 1st Auto PSA 10</StyledText>
                      </StyledView>
                    </StyledView>
                    <StyledView className='w-1/4 ml-4'>
                      <StyledText className='mt-1 text-green-600 font-bold'>$345.34</StyledText>
                      <StyledText className='mt-1 text-green-600 font-bold'>$345.34</StyledText>
                      <StyledText className='mt-1 text-green-600 font-bold'>$345.34</StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>
              </StyledView>
              
            </StyledView>
          </StyledView>
          <StyledView className='mr-2 ml-2 mt-4'>
            <StyledText className='ml-4 font-bold text-lg text-darkGray'>Overview</StyledText>
            <StyledView className='rounded-xl mt-1'>
              <StyledView className='h-px w-full bg-gray'/>
              <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-2'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center justify-center border-2 border-red-500'>
                        <StyledImage source={icons.exclamation} style={{tintColor:'#FF0000'}} className='w-5 h-5'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold text-red-500'>Awaiting Shipment</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{tintColor:'#FF0000', transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
              </StyledPressable>
              <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-2'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center border justify-center'>
                        <StyledImage source={icons.sell} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Manage Listings</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
              </StyledPressable>
              
              <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center border justify-center'>
                        <StyledImage source={icons.dollar} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Sold Items</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
              </StyledPressable>
              
              <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center border justify-center'>
                        <StyledImage source={icons.promo} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Promotions</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
              </StyledPressable>
              
              <StyledPressable className='flex-row items-center justify-between active:bg-gray w-full rounded-xl p-2 mt-4'>
                <StyledView className='flex-row items-center'>
                    <StyledView className='bg-lightGray rounded-full w-10 h-10 items-center border justify-center'>
                        <StyledImage source={icons.edit} style={{tintColor:'#000000'}} className='w-6 h-6'/>
                    </StyledView>
                    <StyledText className='ml-4 font-bold'>Drafts</StyledText>
                </StyledView>
                <StyledImage source={icons.carrotBlack} style={{transform:[{rotate: '270deg'}]}} className='w-4 h-4'/>
              </StyledPressable>
              <StyledView className='h-px w-full bg-gray'/>
            </StyledView>
          </StyledView>
          <StyledView className='h-32'/>
        </StyledSafeAreaView>
      </ScrollView>
      <StyledView className='absolute bottom-2 w-full items-center'>
        {profile?.seller ? (
          <StyledPressable 
            onPress={() => {router.push('/(tabs)/sell/createListing')}}
            className='border bg-primary active:bg-primaryDark rounded-3xl w-5/6 items-center p-2 shadow-sm shadow-darkGray'
          >
            <StyledText className='font-bold text-white text-xl'>Create Listing</StyledText>
          </StyledPressable>
        ):(
        <StyledPressable
          onPress={() => {router.push('/(auth)/sellerSignUp')}}
          className='border bg-primary active:bg-primaryDark rounded-3xl w-5/6 items-center p-2 shadow-sm shadow-darkGray'
        >
          <StyledText className='font-bold text-white text-xl'>Become a Seller</StyledText>
        </StyledPressable>
        )}  
    </StyledView>
  </>
  )
}

export default sell