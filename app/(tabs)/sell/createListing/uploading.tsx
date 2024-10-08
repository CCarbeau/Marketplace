import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, ActivityIndicator, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Modal } from 'react-native';
import { styled } from 'nativewind';
import icons from '../../../../constants/icons';
import { Href, useRouter } from 'expo-router';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledImageBackground = styled(ImageBackground);
const StyledTextInput = styled(TextInput);
const StyledActivityIndicator = styled(ActivityIndicator);

const { width: screenWidth } = Dimensions.get('window');

interface UploadingModalProps {
  visible: boolean;
  progress: number;
  listingUrl: Href<string>;
  onClose: () => void;
}

const UploadingModal: React.FC<UploadingModalProps> = ({ visible, progress, listingUrl, onClose }) => {
  const [animatedProgress] = useState(new Animated.Value(progress));
  const [modalHeight] = useState(new Animated.Value(150)); // Initial modal height
  const router = useRouter();

  useEffect(() => {
    // Animate the progress bar
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300, // Adjust the duration as needed
      useNativeDriver: false,
    }).start();

    // If progress is 100%, increase the modal height to reveal the button
    if (progress === 100) {
      Animated.timing(modalHeight, {
        toValue: 250, // Increase modal height when complete
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress]);

  const animatedWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'], // Start at 0% width and grow to 100%
  });

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <StyledView className="flex-1 justify-center items-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)',}}>
        <Animated.View
          style={{
            height: modalHeight, // Animate modal height
          }}
          className="w-2/3 bg-white rounded-xl shadow-black shadow-xl overflow-hidden items-center"
        >
          <StyledText className="text-xl font-bold mt-2">Uploading</StyledText>
          {progress < 100 ? (
            <StyledActivityIndicator size="large" color="#FF5757" className="mt-4" />
          ) : (
            <StyledView className="flex items-center justify-center bg-primary h-12 w-12 mt-2 rounded-full">
              <StyledImage source={icons.check} className="h-10 w-10" />
            </StyledView>
          )}

          {/* Progress Bar */}
          <StyledView className="h-4 rounded-xl border border-black w-5/6 mt-4 overflow-hidden">
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
          <StyledText className='mt-1'>{Math.round(progress)}%</StyledText>

          {/* View Listing Button */}
          {progress === 100 && (
            <>
                <StyledPressable
                className='border border-black mt-2 rounded-2xl active:bg-gray'
                onPress={() => {
                    router.push('/(tabs)/sell/createListing');
                    onClose(); // Close the modal when navigating
                }}
                >
                <StyledText className="text-black text-xl font-bold pl-4 mt-1 mb-1 pr-4">List Another Item</StyledText>
                </StyledPressable>
                <StyledPressable
                className='border border-black mt-2 rounded-2xl bg-primary active:bg-primaryDark'
                onPress={() => {
                router.push(listingUrl);
                onClose(); // Close the modal when navigating
                }}
            >
                <StyledText className="text-white text-xl font-bold pl-4 mt-1 mb-1 pr-4">View Your Listing</StyledText>
            </StyledPressable>
           </>
          )}
        </Animated.View>
      </StyledView>
    </Modal>
  );
};

export default UploadingModal;