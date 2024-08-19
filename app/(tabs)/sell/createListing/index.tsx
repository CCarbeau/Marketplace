import React, { useState, useRef } from 'react';
import { View, Pressable, Image, Alert, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../../../firebaseConfig';
import { doc, setDoc } from "firebase/firestore"; 
import { styled } from 'nativewind';
import icons from '../../../../constants/icons'
import CategoryModal from './category'

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)
const StyledImageBackground = styled(ImageBackground)
const StyledTextInput = styled(TextInput)

const { width: screenWidth } = Dimensions.get('window');

type Listing = {
  id: number;
  urls: string[];
  title: string;
  description: string;
  price: number;
  likes: number;
  offerable: boolean;
  ownerUID: string;
};

const CreateListing = () => {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDes] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageIndex, setImageIndex]= useState(0);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [currentPage, setCurrentPage] = useState(''); 
  const [directory, setDirectory] = useState(''); 
  const slideAnim = useRef(new Animated.Value(0)).current; // Initial value for the animation

  const [category, setCategory] = useState('');

  const slideToPage = (page) => {
    const toValue = page === 'category' ? 0 : -screenWidth;

    Animated.timing(slideAnim, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setCurrentPage(page));
  };
  
  const ownerUID = auth.currentUser?.uid

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]); 
    }
  };

  const handleImageScroll = (event: any) => {
    const { x } = event.nativeEvent.contentOffset;
    const currentIndex = Math.floor(x / screenWidth); 
    setImageIndex(currentIndex); 
  };

  const handleDelete = () => {

  }

  const uploadImages = async () => {
    if (images.length === 0) {
      Alert.alert("Please select at least one image first!");
      return;
    }
  
    setUploading(true);
    const downloadURLs: string[] = [];
  
    try {
      for (const image of images) {
        const response = await fetch(image);
        const blob = await response.blob();
        const filename = image.substring(image.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `images/${filename}`);
  
        const uploadTask = uploadBytesResumable(storageRef, blob);
  
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (error) => {
              Alert.alert('Upload failed!');
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at', downloadURL);
                downloadURLs.push(downloadURL);
                resolve();
              } catch (error) {
                console.error('Error getting download URL:', error);
                Alert.alert('Error', 'Failed to retrieve download URL.');
                reject(error);
              }
            }
          );
        });
      }
  
      // After all images are uploaded, save the listing data in Firestore
      const newDocRef = doc(db, "listings");
  
      await setDoc(newDocRef, {
        title: title,
        description: description,
        price: price,
        images: downloadURLs, // Save all download URLs
        likes: 0,
        offerable: true,
        ownerUID: auth.currentUser?.uid,
      });
  
      Alert.alert('Upload successful!', 'Listing created successfully.');
      setUploading(false);
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Error', 'Failed to upload images.');
      setUploading(false);
    }
  };  

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory); // Update the main component's state
  };

  return (
    <StyledView className='justify-center flex-1'>
      <StyledView className={`${minimized ? 'bg-gray': 'bg-white'} flex-1 h-full w-full`}>
        <StyledScrollView className='mt-16'>
          <StyledView className='h-96 mt-8'>
            <StyledScrollView className='flex-1' horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleImageScroll} scrollEventThrottle={16}>
              {images.map((imageUri, index) => (
                  <StyledImageBackground
                    key={index}
                    source={{ uri: imageUri }}
                    className="h-96"
                    style={{ width: screenWidth }}
                  >
                    <StyledPressable className='flex justify-center items-center absolute top-2 right-2 w-12 h-12 bg-black rounded-full' onPress={handleDelete}>
                      <StyledImage source={icons.trash} className='w-8 h-8'></StyledImage>
                    </StyledPressable>
                  </StyledImageBackground>
                ))}
              <StyledPressable onPress={pickImage} className='flex-1 h-96 justify-center items-center bg-gray' style={{ width: screenWidth }}>
                <StyledText className='text-8xl font-bold'>+</StyledText>
                <StyledText className='text-2xl font-bold'>Add photos</StyledText>
              </StyledPressable>
            </StyledScrollView>
            <StyledView className='flex flex-row justify-center gap-x-8 bottom-8'>
              {[...images,null].map((_, index) => (
                <StyledView key={index} className={`${index===imageIndex ? 'bg-primary': 'bg-white'} w-3 h-3 rounded-full`} />
              ))}
            </StyledView>
          </StyledView>
          <StyledView className='w-full pl-4 pr-4'>
            <StyledTextInput 
              className='text-3xl font-bold mt-2' 
              placeholder='Title' 
              value={title} 
              onChangeText={(text) => setTitle(text)} 
            />
            <StyledTextInput 
              className='text-gray' 
              placeholder='Description' 
              value={description} 
              onChangeText={(text) => setDes(text)} 
            />
            <StyledView className='flex flex-row items-center mt-4'>
              <StyledText className='text-xl font-bold'>$</StyledText>
              <StyledTextInput 
                className='text-xl ml-1 font-bold pb-1' 
                placeholder='Price' 
                value={price} 
                onChangeText={(text) => setPrice(text)} 
                keyboardType='numeric' 
              />
              <StyledText className='text-gray pl-2'>+ shipping & taxes</StyledText>
            </StyledView>
          </StyledView>
          <StyledView className='bg-gray mt-2 w-full h-px'/>
          <StyledView className='flex pl-4 pr-4 mt-2 w-full'>
            <StyledText className='text-2xl font-bold text-black'>Details</StyledText>
            <StyledView className='flex-row gap-x-4'>
              <StyledText className='text-lg'>Category: </StyledText>
              <StyledPressable className='border-2 border-black rounded-lg'onPress={() => {setMinimized(true); setDirectory('category'); setCategoryModalVisible(true);}}>
                {category==='' ? (
                  <StyledText className='text-lg text-gray pl-12 pr-12'>Select Category</StyledText>
                ):(
                  <StyledText className='text-lg pl-12 pr-12'>{category}</StyledText>
                )}
                
              </StyledPressable>
            </StyledView>
          </StyledView>
          <CategoryModal visible={categoryModalVisible}
            onClose={() => {setMinimized(false); setCategoryModalVisible(false);}}
            onSelectCategory={handleCategorySelect}
          />
          <StyledPressable onPress={uploadImages} disabled={uploading}>
            <StyledText>Create Listing</StyledText>
          </StyledPressable>
        </StyledScrollView>
      </StyledView>
    </StyledView>

  );
};

export default CreateListing;