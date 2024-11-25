import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, ImageBackground, Animated, Alert } from 'react-native';
import { styled } from 'nativewind';
import PulsatingCircle from '@/components/PulsatingCircle';
import { Listing } from '@/types/interfaces';
import { handleCustomBid, handleEdit, handleOffer, handlePurchase } from '../../src/functions/userInput';

const StyledPressable = styled(Pressable);
const StyledView = styled(View);
const StyledText = styled(Text);

interface BottomBarProps{
    listing: Listing,
    isOwner: boolean,
}


// Render Bottom Bar
const RenderBottomBar: React.FC<BottomBarProps> = ({listing: listing, isOwner: isOwner}) => {
    // Bid/Buy Now Button Animation
    const [progress] = useState(new Animated.Value(0));

    const handlePressIn = () => {
        Animated.timing(progress, {
        toValue: 1,
        duration: 1500, // 3 seconds for full color change
        useNativeDriver: false,
        }).start(({ finished }) => {
        if(finished){
            handlePurchase();
        }
        });
    };

    const handlePressOut = () => {
        Animated.timing(progress, {
        toValue: 0,
        duration: 500, // quickly reset to the initial state
        useNativeDriver: false,
        }).start();
    };

    const animatedWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'], // Start at 0% width and grow to 100%
    });
    
    if(!listing){
        return <StyledText className="text-center mt-4">Listing not found</StyledText>;
    }

    if(isOwner){
        return(
            <StyledView className='w-full'>
                <StyledPressable 
                    className='bg-primary active:bg-primaryDark rounded-xl justify-center items-center mr-2 h-10 mt-2 shadow-sm shadow-darkGray'
                    onPress={handleEdit}
                >
                    <StyledText className='text-white text-lg font-bold text-center'>Edit</StyledText>
                </StyledPressable>
            </StyledView>
        )
    }

    return (
        <StyledView className='h-11 w-full'>
            {listing.listingType === 'fixed' ? (
                <StyledView className='flex-1 flex-row mt-2 rounded-xl shadow-sm shadow-darkGray w-full gap-x-2'>
                    <StyledPressable
                        className='flex-1 flex-row basis-2/3 bg-primary active:bg-primaryDark rounded-xl overflow-hidden justify-evenly items-center'
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    >
                        <Animated.View
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                backgroundColor: '#00DE00',
                                width: animatedWidth,
                            }}
                        />
                        <StyledView className='flex-1 flex-row gap-x-2 justify-center'>
                            <StyledText className='text-white text-lg font-bold shadow-sm shadow-gray'>${listing.price}</StyledText>
                            <StyledText className='text-white font-bold text-lg shadow-sm shadow-gray'>Buy Now</StyledText>
                        </StyledView>
                        <StyledView className='mr-4'>
                            <PulsatingCircle/>
                        </StyledView>
                    </StyledPressable>
                    {listing.offerable && 
                        <StyledPressable 
                            className='flex-1 basis-1/3 bg-darkerWhite active:bg-gray rounded-xl justify-center items-center h-full'
                            onPress={handleOffer}
                        >
                            <StyledText className='text-black text-lg font-bold text-center border-2'>Offer</StyledText>
                        </StyledPressable>
                    }
                </StyledView>
                
            ) : (
                <StyledView className='flex-1 flex-row mt-2 rounded-xl shadow-sm shadow-gray w-full gap-x-2'>
                    <StyledPressable
                        className='flex-1 flex-row basis-2/3 bg-primary active:bg-primaryDark rounded-xl overflow-hidden justify-between items-center'
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    >
                        <Animated.View
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                backgroundColor: '#00DE00',
                                width: animatedWidth,
                            }}
                        />
                        <StyledView className='flex-1 flex-row gap-x-2 justify-center'>
                            <StyledText className='text-white text-lg font-bold shadow-sm shadow-gray'>${listing.price}</StyledText>
                            <StyledText className='text-white font-bold text-lg shadow-sm shadow-gray'>Bid</StyledText>
                        </StyledView>
                        <StyledView className='mr-4'>
                            <PulsatingCircle/>
                        </StyledView>
                    </StyledPressable>
                    <StyledPressable 
                        className='flex-1 basis-1/3 bg-darkerWhite active:bg-gray rounded-xl justify-center items-center h-full'
                        onPress={handleCustomBid}
                    >
                        <StyledText className='text-black text-lg font-bold text-center border-2'>Custom</StyledText>
                    </StyledPressable>
                </StyledView>
            )}
        </StyledView>
    )
}

export default RenderBottomBar;