import React, { useState, useEffect} from 'react';
import { View, Pressable, Image, ActivityIndicator, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Modal } from 'react-native';
import { styled } from 'nativewind';
import icons from '../../../../constants/icons';

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)
const StyledImageBackground = styled(ImageBackground)
const StyledTextInput = styled(TextInput)
const StyledActivityIndicator = styled(ActivityIndicator)

const { width: screenWidth } = Dimensions.get('window');

interface UploadingModalProps {
    visible: boolean;
    progress: number;
    onClose: () => void;
}

const UploadingModal: React.FC<UploadingModalProps> = ({visible, progress, onClose}) => {
    const [animatedProgress] = useState(new Animated.Value(progress));

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progress,
            duration: 300, // Adjust the duration as needed
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const animatedWidth = animatedProgress.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'], // Start at 0% width and grow to 100%
    });
    
    return(
        <Modal animationType='slide' transparent={true} visible={visible}>
            <StyledView className='flex-1 bg-opacity-50 justify-center items-center'>
                <StyledView className='flex h-1/6 w-2/3 bg-white rounded-xl shadow-black shadow-xl overflow-hidden items-center'>
                    <StyledText className='text-xl font-bold mt-2'>Uploading</StyledText>
                        {progress<100 ? ( 
                            <StyledActivityIndicator size="large" color="#FF5757" className='mt-4'/>            
                        ):(
                            <StyledView className='flex items-center justify-center bg-primary h-12 w-12 rounded-full'>
                                <StyledImage source={icons.check} className='h-10 w-10'/>
                            </StyledView>
                        )}
                    <StyledView className='h-4 rounded-xl border border-black w-5/6 mt-4 overflow-hidden'>
                        <Animated.View
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                backgroundColor: '#FF5757',
                                width: animatedWidth, 
                            }}
                        />
                    </StyledView>
                    <StyledText>{Math.round(progress)}%</StyledText>
                </StyledView>
            </StyledView>
        </Modal>
    )
}

export default UploadingModal;