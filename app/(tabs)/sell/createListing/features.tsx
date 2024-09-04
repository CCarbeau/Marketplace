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

const FeaturesModal = ({ visible, onClose, onSelectFeatures }) => {
    const options = ['1st Edition','Autographed','Box Topper','Image Variation','Insert','Miscut','Misprint','One of One','Parallel','Printing Plate','Redemption','Rookie','Serial Numbered','Short Print'];
    const [features, setFeatures] = useState<string[]>([]);

    const handleFeaturesSelect = (feature: string) => {
        setFeatures(prevFeatures => {
            if(prevFeatures.includes(feature)){
                return prevFeatures.filter((i) => i!=feature);
            }else{
                return [...prevFeatures,feature];
            }
        })
    };

    const handleDone = () => {
        onSelectFeatures(features);
        onClose();
    }

    return(
        <Modal animationType='slide' transparent={true} visible={visible}>
            <StyledView className='flex-1 bg-opacity-50 justify-end'>
                <StyledView className='h-5/6 w-full bg-white rounded-xl shadow-black shadow-xl overflow-hidden'>
                    <StyledScrollView style={{ width: screenWidth }}>
                        <StyledPressable onPress={() => handleDone()} className='flex w-full h-5 items-center'>
                            <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-2'></StyledImage>
                        </StyledPressable>
                        <StyledText className='text-2xl text-primary text-center mt-4 font-bold'>Select Features</StyledText>
                        <StyledView className='bg-gray mt-2 w-full h-px' />
                        {options.map((option) => (
                            <React.Fragment>
                                <StyledPressable
                                    key={option}
                                    onPress={() => handleFeaturesSelect(option)}
                                    className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                >
                                    <StyledText className='text-xl pl-4'>{option}</StyledText>
                                    {features.includes(option) && (
                                        <StyledImage source={icons.check} style={{tintColor:'#FF5757'}} className='h-5 w-5 mr-2'/>
                                    )}
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

export default FeaturesModal;