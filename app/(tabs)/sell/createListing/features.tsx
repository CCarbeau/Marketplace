import React, { useState, useRef } from 'react';
import { View, Pressable, Image, StyleSheet, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions } from 'react-native'
import { styled } from 'nativewind';
import Modal from 'react-native-modal'
import icons from '../../../../constants/icons'

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)

const { width: screenWidth } = Dimensions.get('window');

interface FeaturesModalProps{
    visible: boolean; 
    onClose: () => void; 
    onSelectFeatures: (features: string[]) => void;
}

const FeaturesModal: React.FC<FeaturesModalProps> = ({ visible, onClose, onSelectFeatures }) => {
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

const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0, // Ensures modal takes full width of the screen
    },
});

export default FeaturesModal;