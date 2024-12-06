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

interface GradeModalProps {
    visible: boolean;
    grader: string;
    onClose: () => void;
    onSelectGrade: (grade:string) => void;
}

const gradingScales: Record<string, string[]> = {
    PSA: [
      '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', 
      '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', 'Authentic', 'Altered',
    ],
    BGS: [
      'Black Label 10', '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', 
      '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1',
    ],
    SGC: [
      'Pristine 10', '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', 
      '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1',
    ],
    'Arena Club': [
      '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', 
      '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1',
    ],
    CGC: [
      '10', '9.9', '9.8', '9.6', '9.4', '9.2', '9', '8.5', '8', '7.5', '7', 
      '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.8', 
      '1.5', '1', '0.5',
    ],
    CSG: [
      '10', '9.9', '9.8', '9.6', '9.4', '9.2', '9', '8.5', '8', '7.5', '7', 
      '6.5', '6', '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.8', 
      '1.5', '1', '0.5',
    ],
    HGA: [
      '10 FL', '10 GM', '9.0', '8.5', '8.0', '7.5', '7.0', '6.5', '6.0', 
      '5.5', '5.0', '4.5', '4.0', '3.5', '3.0', '2.5', '2.0', '1.5', '1.0',
    ],
    KSA: [
      '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', 
      '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', 'Authentic - Trimmed', 
      'Authentic - Colored',
    ],
    'Rare Edition': [
      '10 GEM-MT', '9 MINT', '8 NM-MT', '7 NM', '6 EX-MT', '5 EX', 
      '4 VG-EX', '3 VG', '2 G', '1 P',
    ],
    TAG: [
      'Pristine 10', '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', 
      '5.5', '5', '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1',
    ],
    Other: [
      '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5.5', '5', 
      '4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1',
    ],
  };  
  

const GradeModal: React.FC<GradeModalProps> = ({ visible, grader, onClose, onSelectGrade }) => {
    
    const options = gradingScales[grader] || gradingScales['Other'];

    const handleGradeSelect = (grade: string) => {
        onSelectGrade(grade); 
        onClose(); 
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
                        <StyledText className='text-2xl text-primary text-center mt-4 font-bold'>Select Grade</StyledText>
                        <StyledView className='bg-gray mt-2 w-full h-px' />
                        {options.map((option) => (
                            <React.Fragment key={option}>
                                <StyledPressable
                                    key={option}
                                    onPress={() => handleGradeSelect(option)}
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

export default GradeModal;