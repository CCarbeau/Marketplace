import React, { useState, useRef } from 'react';
import { View, Pressable, Image, Alert, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../../../firebaseConfig';
import { doc, setDoc } from "firebase/firestore"; 
import { styled } from 'nativewind';
import icons from '../../../../constants/icons'

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)
const StyledImageBackground = styled(ImageBackground)
const StyledTextInput = styled(TextInput)

const { width: screenWidth } = Dimensions.get('window');

const ShippingModal = ({ visible, onClose, onSelectShipping }) => {
    // const options = {
    // 'USPS First Class Mail Letter': {'cost': 1, 'size': '6.13 x 11.15 x 1/4 in', 'weight': '<3.5 oz'}, 
    // 'USPS First Class Mail Envelope':{'cost': 2, 'size': '12 x 15 x 3/4 in', 'weight': '<13 oz'},
    // 'USPS Ground Advantage' : {'cost': 3}}

    const options =['USPS First Class Mail Letter', 'USPS First Class Mail Envelope', 'USPS Ground Advantage']

    const handleShippingSelect = (shipping: string) => {
        onSelectShipping(shipping); // Pass selected category back to the parent
        onClose(); // Optionally close the modal after selection
    };

    return(
        <Modal animationType='slide' transparent={true} visible={visible}>
            <StyledView className='flex-1 bg-opacity-50 justify-end'>
                <StyledView className='h-5/6 w-full bg-white rounded-xl shadow-black shadow-xl overflow-hidden'>
                    <StyledScrollView style={{ width: screenWidth }}>
                    <StyledPressable onPress={() => onClose()} className='flex w-full h-5 items-center'>
                            <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-2'></StyledImage>
                        </StyledPressable>
                        <StyledText className='text-2xl text-primary text-center mt-4 font-bold'>Select Shipping</StyledText>
                        <StyledView className='bg-gray mt-2 w-full h-px' />
                        {options.map((option) => (
                            <React.Fragment>
                                <StyledPressable
                                    key={option}
                                    onPress={() => handleShippingSelect(option)}
                                    className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                >
                                    <StyledText className='text-xl pl-4'>{option}</StyledText>
                                </StyledPressable>
                                <StyledView className='bg-gray w-full h-px' />
                            </React.Fragment>
                        ))}
                        <StyledView className='w-full h-32'/>
                    </StyledScrollView>
                </StyledView>
            </StyledView>
        </Modal>
    )
}

export default ShippingModal;