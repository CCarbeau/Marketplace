import React, { useState, useRef } from 'react';
import { View, Pressable, Image, Alert, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Modal } from 'react-native'
import { styled } from 'nativewind';
import icons from '../../constants/icons'

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)

const { width: screenWidth } = Dimensions.get('window');

interface InterestsModalProps{
    visible: boolean; 
    onClose: () => void; 
    onSelectInterests: (features: string[]) => void;
}

const InterestModal: React.FC<InterestsModalProps> = ({ visible, onClose, onSelectInterests }) => {
    const options = ['Breaks', 'Comics', 'Manga', 'Memorabilia', 'Singles', 'Sports', 'TCG', 'Toys & Collectibles', 'Wax'];
    const [interests, setInterests] = useState<string[]>([]);

    const handleInterestsSelect = (interest: string) => {
        setInterests(prevInterests => {
            if(prevInterests.includes(interest)){
                return prevInterests.filter((i) => i!=interest);
            }else{
                return [...prevInterests,interest];
            }
        })
    };

    const handleDone = () => {
        onSelectInterests(interests);
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
                        <StyledText className='text-2xl text-primary text-center mt-4 font-bold'>Select Interests</StyledText>
                        <StyledView className='bg-gray mt-2 w-full h-px' />
                        {options.map((option) => (
                            <React.Fragment key={option}>
                                <StyledPressable
                                    onPress={() => handleInterestsSelect(option)}
                                    className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                >
                                    <StyledText className='text-xl pl-4'>{option}</StyledText>
                                    {interests.includes(option) && (
                                        <StyledImage source={icons.check} style={{tintColor:'#FF5757'}} className='h-5 w-5 mr-2'/>
                                    )}
                                </StyledPressable>
                                <StyledView className='bg-gray w-full h-px' />
                            </React.Fragment>
                        ))}
                        <StyledView className='w-full h-32'/>
                        <StyledPressable className='mr-4 ml-4 flex-1 basis-2/3 mt-12 p-2 bg-primary rounded-xl active:bg-primaryDark' onPress={() => {handleDone()}}>
                          <StyledText className='text-white text-xl font-bold text-center'>Finish</StyledText>
                        </StyledPressable>
                    </StyledScrollView>
                </StyledView>
            </StyledView>
        </Modal>
    )
}

export default InterestModal;