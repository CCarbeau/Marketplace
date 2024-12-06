import React, { useState, useRef } from 'react';
import { View, Pressable, Image, StyleSheet, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { styled } from 'nativewind';
import icons from '../../../../constants/icons'

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)

const { width: screenWidth } = Dimensions.get('window');

type Grader = 'PSA' | 'BGS' | 'SGC' | 'Arena Club' | 'CGC' | 'CSG' | 'HGA' | 'KSA' | 'Rare Edition' | 'TAG' | 'Other';

interface GraderModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectGrader: (grader: string) => void;
}

const GraderModal: React.FC<GraderModalProps> = ({ visible, onClose, onSelectGrader }) => {
    const options =['PSA', 'BGS', 'SGC', 'Arena Club', 'CGC', 'CSG', 'HGA', 'KSA', 'Rare Edition', 'TAG', 'Other']

    const handleGraderSelect = (grader: string) => {
        onSelectGrader(grader); // Pass selected category back to the parent
        onClose(); // Optionally close the modal after selection
    };

    return(
        <Modal isVisible={visible} 
            style={styles.modal}
            onBackdropPress={onClose} 
            swipeDirection="down"
            onSwipeComplete={onClose}
            animationIn="slideInUp"
            animationOut="slideOutDown"
        >
            <StyledView className='flex-1 justify-end' style={{backgroundColor: 'rgba(0, 0, 0, 0.5)',}}>
                <StyledView className='h-5/6 w-full bg-white rounded-xl shadow-black shadow-xl overflow-hidden'>
                    <StyledScrollView style={{ width: screenWidth }}>
                    <StyledPressable onPress={() => onClose()} className='flex w-full h-5 items-center'>
                            <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-2'></StyledImage>
                        </StyledPressable>
                        <StyledText className='text-2xl text-primary text-center mt-4 font-bold'>Select Grader</StyledText>
                        <StyledView className='bg-gray mt-2 w-full h-px' />
                        {options.map((option) => (
                            <React.Fragment key={option}>
                                <StyledPressable
                                    key={option}
                                    onPress={() => handleGraderSelect(option)}
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

const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0, // Ensures modal takes full width of the screen
    },
});

export default GraderModal;