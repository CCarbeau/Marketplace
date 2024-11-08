import React, { useState, useRef } from 'react';
import { View, Pressable, Image, Alert, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Href, Router, useRouter } from 'expo-router';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, list } from 'firebase/storage';
import { db, storage, auth } from '../../../../src/auth/firebaseConfig';
import { collection, addDoc } from "firebase/firestore"; 
import { styled } from 'nativewind';

import DateTimePicker from '@react-native-community/datetimepicker';
import icons from '../../../../constants/icons'
import CategoryModal from './category'
import BrandModal from './brand';
import FeaturesModal from './features';
import ShippingModal from './shipping';
import UploadingModal from './uploading';

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)
const StyledImageBackground = styled(ImageBackground)
const StyledTextInput = styled(TextInput)

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const { width: screenWidth } = Dimensions.get('window');

const CreateListing = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageIndex, setImageIndex]= useState(0);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [featuresModalVisible, setFeaturesModalVisible] = useState(false);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));
  
  const [category, setCategory] = useState('');
  const [genre, setGenre] = useState('')
  const [title, setTitle] = useState('');
  const [description, setDes] = useState('');
  const [price, setPrice] = useState('');
  const [quantity,setQuantity] = useState('');
  const [offerable, setOfferable] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [athlete, setAthlete] = useState('');
  const [team, setTeam] = useState('');
  const [year, setYear] = useState('');
  const [brand, setBrand] = useState('');
  const [set, setSet] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [parallel, setParallel] = useState('');
  const [printRun, setPrintRun] = useState('');
  const [listingType, setListingType] = useState('');
  const [shippingType, setShippingType] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState('7');
  const [shippingCost, setShippingCost] = useState('');
  const [weight, setWeight ] = useState('');
  const [shippingProfile, setShippingProfile] = useState('');
  const [cardsInLot, setCardsInLot] = useState('');

  const [listingUrl, setListingUrl] = useState<Href<string>>('/');
  
  const [progress] = useState(new Animated.Value(0));

  const handlePressIn = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1500, // 3 seconds for full color change
      useNativeDriver: false,
    }).start(({ finished }) => {
      if(finished){
        createListing();
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
    const newImages = images.filter((_, index) => index !== imageIndex);
    setImages(newImages);

    scrollViewRef.current?.scrollTo({ x: imageIndex * screenWidth, animated: true });

  }

  const createListing = async () => {
    if (images.length === 0) {
      Alert.alert("Please select at least one image first!");
      return;
    }

    if (title === '') {
      Alert.alert("A title is required");
      return;
    }

    if (description === '') {
      Alert.alert("A description is required");
      return;
    }

    if (price === ''){
      Alert.alert("A price is required");
      return;
    }

    if (quantity === '') {
      Alert.alert("A quantity is required");
      return;
    }

    if (category === ''){
      Alert.alert("A category is required");
      return;
    }

    if (listingType === '') {
      Alert.alert("A listing type is required");
      return;
    }

    if (listingType === 'auction' && Number(quantity) > 1) {
      Alert.alert("Auctions must have a quantity of 1");
      return;
    }

    if (shippingType === '') {
      Alert.alert("A shipping type is required");
      return;
    }

    if (shippingType ==='variable' && weight===''){
      Alert.alert("A weight is required")
      return;
    }

    if (shippingType ==='variable' && shippingProfile===''){
      Alert.alert("A shipping service is required")
      return;
    }

    if (shippingType ==='fixed' && shippingCost===''){
      Alert.alert("A shipping cost is required")
      return;
    }

    if (Number(duration) > 14){
      Alert.alert("Auctions cannot be longer than 2 weeks")
      return;
    }
  
    setUploading(true);

    const downloadURLs: string[] = [];
    const uploadedImageRefs: any[] = [];
  
    try {
      for (const image of images) {
        // Fetch image and handle potential errors
        let blob;
        try {
          const response = await fetch(image);
          blob = await response.blob();
        } catch (error) {
          Alert.alert("Error", "Failed to fetch image. Please try again.");
          console.error('Error fetching image:', error);
          throw error;
        }
  
        const filename = image.substring(image.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `images/${filename}`);
  
        const uploadTask = uploadBytesResumable(storageRef, blob);
  
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            // Handle progress (if needed)
            (snapshot) => {
              setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            },
            // Handle error properly here
            (error) => {
              console.error('Upload error:', error);
              Alert.alert('Upload failed!');
              reject(error);
            },
            // Handle successful completion
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at', downloadURL);
                downloadURLs.push(downloadURL);
                uploadedImageRefs.push(storageRef);
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
      
      const includeIfDefined = (key: string, value: string) => (value !== undefined && value !== null ? { [key]: value } : {});
    

      const docData = {
        downloadURLs,
        title,
        description,
        price,
        quantity,
        category,
        
        // Condition for 'Singles' in 'Sports Cards'
        ...(category.slice(-7) === 'Singles' && genre === 'Sports Cards' ? {
          ...includeIfDefined('athlete', athlete),
          ...includeIfDefined('team', team),
          ...includeIfDefined('year', year),
          ...includeIfDefined('brand', brand),
          ...includeIfDefined('set', set),
          ...(features && {features}),
          ...includeIfDefined('parallel', parallel),
          ...includeIfDefined('printRun', printRun),
        } : {}),
        
        // Condition for 'Lot' in 'Sports Cards'
        ...(category.slice(-3) === 'Lot' && genre === 'Sports Cards' ? {
          ...includeIfDefined('cardsInLot', cardsInLot),
          ...(athlete ? { athletes: athlete.split(',') } : {}),
          ...(team ? { teams: team.split(',') } : {}),
          ...includeIfDefined('year', year),
          ...includeIfDefined('brand', brand),
          ...includeIfDefined('set', set),
          ...(features && {features}),
        } : {}),
        
        // Condition for 'Wax' in 'Sports Cards'
        ...(category.slice(-3) === 'Wax' && genre === 'Sports Cards' ? {
          ...includeIfDefined('year', year),
          ...includeIfDefined('brand', brand),
          ...includeIfDefined('set', set),
        } : {}),
        
        // Condition for 'Break' in 'Sports Cards'
        ...(category.slice(-5) === 'Break' && genre === 'Sports Cards' ? {
          ...(athlete ? { athletes: athlete.split(',') } : {}),
          ...(team ? { teams: team.split(',') } : {}),
          ...includeIfDefined('year', year),
          ...includeIfDefined('brand', brand),
          ...includeIfDefined('set', set),
        } : {}),
        
        // Condition for 'Sports Memorabilia'
        ...(genre === 'Sports Memorabilia' ? {
          ...includeIfDefined('athlete', athlete),
          ...includeIfDefined('team', team),
          ...includeIfDefined('year', year),
        } : {}),
        
        listingType,
        ...(listingType === 'auction' ? { duration } : {}),
        offerable,
        scheduled,
        bids: 0,
        ...(scheduled ? { date, time } : {}),
        shippingType,
        ...(shippingType === 'variable' ? { weight, shippingProfile } : { shippingCost }),
        likes: 0,
        ownerUID: auth.currentUser?.uid,
      };
  
      try{

        const response = await fetch(`${API_URL}/add-listing`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(docData),
        
        })

        // Check if the backend returned an error
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error:', errorData.error);
          throw new Error(errorData.error || 'Failed to add listing.');
        }

        const data = await response.json();
        setListingUrl(data.listingUrl);

        
        await delay(3000);

      } catch (error) {
        console.error('Error uploading images:', error);
        Alert.alert('Error', 'Failed to upload images or create the listing.');

        // If Firestore upload fails, delete the images from Firebase Storage
        for (const storageRef of uploadedImageRefs) {
          try {
            await deleteObject(storageRef);
            console.log('Deleted uploaded image from storage:', storageRef.fullPath);
          } catch (deleteError) {
            console.error('Failed to delete image from storage:', deleteError);
          }
        }

        setUploading(false);
      }
    }catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Error', 'Failed to upload images or create the listing.');

      // If Firestore upload fails, delete the images from Firebase Storage
      for (const storageRef of uploadedImageRefs) {
        try {
          await deleteObject(storageRef);
          console.log('Deleted uploaded image from storage:', storageRef.fullPath);
        } catch (deleteError) {
          console.error('Failed to delete image from storage:', deleteError);
        }
      }

      setUploading(false);
    }
  };  

  const handleCategorySelect = (selectedCategory: string, selectedGenre: string) => {
    setCategory(selectedCategory); // Update the main component's state
    setGenre(selectedGenre);
  };

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand); 
  };

  const handleFeaturesSelect = (selectedFeatures: string[]) => {
    setFeatures(selectedFeatures); 
  };

  const handleShippingSelect = (selectedShipping: string) => {
    setShippingProfile(selectedShipping)
  }

  return (
    <StyledView className='justify-center flex-1'>
      <StyledView className={'bg-white flex-1 h-full w-full'}>
        <StyledScrollView className=''>
          <StyledView className='h-96'>
            <StyledScrollView className='flex-1 h-full' horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleImageScroll} scrollEventThrottle={16}>
              {images.map((imageUri, index) => (
                  <StyledImageBackground
                    key={index}
                    source={{ uri: imageUri }}
                    className="h-96"
                    style={{ width: screenWidth }}
                  >
                    <StyledPressable className='flex justify-center items-center absolute top-8 right-4 w-12 h-12 bg-black rounded-full active:bg-gray' onPress={handleDelete} style={{ zIndex: 10 }}>
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
            <StyledView className="flex flex-row items-center justify-between">
              <StyledView className="flex flex-row items-center">
                <StyledText className="text-lg">Quantity:</StyledText>
                <StyledView className='border-2 border-gray rounded-xl ml-2'>
                  <StyledTextInput 
                    className="text-xl text-center w-12 mb-1 font-bold"
                    value={quantity} 
                    onChangeText={(text) => setQuantity(text)} 
                    keyboardType="numeric" 
                  />
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>
          <StyledView className='bg-gray mt-4 w-full h-px'/>
          <StyledView className='flex pl-4 pr-4 mt-4 w-full'>
            <StyledText className='text-2xl font-bold text-black'>Details</StyledText>
            <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
              <StyledText className='text-lg'>Category: </StyledText>
              <StyledPressable className='border-2 border-gray rounded-lg w-2/3 active:bg-gray' onPress={() => {setCategoryModalVisible(true);}}>
                {category==='' ? (
                  <StyledText className='text-lg text-gray text-center font-bold'>Select Category</StyledText>
                ):(
                  <StyledText className='text-lg text-primary text-center font-bold shadow-sm'>{category}</StyledText>
                )}
              </StyledPressable>
            </StyledView>

            {category.slice(-7)==='Singles' && genre==='Sports Cards' && (
              <>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Athlete: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Athlete Name'
                      placeholderTextColor='gray'
                      value={athlete} 
                      onChangeText={(text) => setAthlete(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Team: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Team Name'
                      placeholderTextColor='gray'
                      value={team} 
                      onChangeText={(text) => setTeam(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Year: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Year'
                      placeholderTextColor='gray'
                      value={year} 
                      onChangeText={(text) => setYear(text)}
                      keyboardType='numeric'
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Brand: </StyledText>
                  <StyledPressable className='border-2 border-gray rounded-lg w-2/3 active:bg-gray' onPress={() => {setBrandModalVisible(true);}}>
                    {brand==='' ? (
                      <StyledText className='text-lg text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                    ):(
                      <StyledText className='text-lg text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                    )}
                  </StyledPressable>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Set: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Set Name'
                      placeholderTextColor='gray'
                      value={set} 
                      onChangeText={(text) => setSet(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Features: </StyledText>
                  <StyledPressable className='border-2 border-gray rounded-lg w-2/3 active:bg-gray' onPress={() => {setFeaturesModalVisible(true);}}>
                    {features.length===0 ? (
                      <StyledText className='text-lg text-gray text-center font-bold shadow-sm'>Select Features</StyledText>
                    ):(
                      <StyledText className='text-lg text-primary text-center font-bold shadow-sm'>{features.join(', ')}</StyledText>
                    )}
                  </StyledPressable>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Parallel: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Parallel Name'
                      placeholderTextColor='gray'
                      value={parallel} 
                      onChangeText={(text) => setParallel(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Print Run: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Print Run'
                      placeholderTextColor='gray'
                      value={printRun} 
                      onChangeText={(text) => setPrintRun(text)}
                      keyboardType='numeric'
                    />
                  </StyledView>
                </StyledView>
              </>
            )}

            {category.slice(-3)==='Lot' && genre==='Sports Cards' && (
              <>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Cards in Lot: </StyledText>
                  <StyledView className='flex-row items-center border-2 border-gray rounded-xl'>
                    <StyledTextInput 
                      className='text-xl text-center w-12 font-bold mb-1 shadow-sm text-primary'
                      value={cardsInLot} 
                      onChangeText={(text) => setCardsInLot(text)} 
                      keyboardType="numeric" 
                    />
                    <StyledText className='text-lg mr-2 text-gray'>Cards</StyledText>
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Atheletes: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Athelete Names'
                      placeholderTextColor='gray'
                      value={athlete} 
                      onChangeText={(text) => setAthlete(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Teams: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Team Names'
                      placeholderTextColor='gray'
                      value={team} 
                      onChangeText={(text) => setTeam(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Year: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Year'
                      placeholderTextColor='gray'
                      value={year} 
                      onChangeText={(text) => setYear(text)}
                      keyboardType='numeric'
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Brand: </StyledText>
                  <StyledPressable className='border-2 border-gray rounded-lg w-2/3 active:bg-gray' onPress={() => {setBrandModalVisible(true);}}>
                    {brand==='' ? (
                      <StyledText className='text-lg text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                    ):(
                      <StyledText className='text-lg text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                    )}
                  </StyledPressable>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Set: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Set Name'
                      placeholderTextColor='gray'
                      value={set} 
                      onChangeText={(text) => setSet(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Features: </StyledText>
                  <StyledPressable className='border-2 border-gray rounded-lg w-2/3 active:bg-gray' onPress={() => {setFeaturesModalVisible(true);}}>
                    {features.length===0 ? (
                      <StyledText className='text-lg text-gray text-center font-bold shadow-sm'>Select Features</StyledText>
                    ):(
                      <StyledText className='text-lg text-primary text-center font-bold shadow-sm'>{features}</StyledText>
                    )}
                  </StyledPressable>
                </StyledView>
              </>
            )}

            {category.slice(-3)==='Wax' && genre==='Sports Cards' && (
              <>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Brand: </StyledText>
                  <StyledPressable className='border-2 border-gray rounded-lg w-2/3 active:bg-gray' onPress={() => {setBrandModalVisible(true);}}>
                    {brand==='' ? (
                      <StyledText className='text-lg text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                    ):(
                      <StyledText className='text-lg text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                    )}
                  </StyledPressable>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Set: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Set Name'
                      placeholderTextColor='gray'
                      value={set} 
                      onChangeText={(text) => setSet(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Year: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Year'
                      placeholderTextColor='gray'
                      value={year} 
                      onChangeText={(text) => setYear(text)}
                      keyboardType='numeric'
                    />
                  </StyledView>
                </StyledView>
              </>
            )}

            {category.slice(-5)==='Break' && genre==='Sports Cards' && (
              <>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Athelete(s): </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Athelete Names'
                      placeholderTextColor='gray'
                      value={athlete} 
                      onChangeText={(text) => setAthlete(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Team(s): </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Team Names'
                      placeholderTextColor='gray'
                      value={team} 
                      onChangeText={(text) => setTeam(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Brand: </StyledText>
                  <StyledPressable className='border-2 border-gray rounded-lg w-2/3 active:bg-gray' onPress={() => {setBrandModalVisible(true);}}>
                    {brand==='' ? (
                      <StyledText className='text-lg text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                    ):(
                      <StyledText className='text-lg text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                    )}
                  </StyledPressable>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Set: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Set Name'
                      placeholderTextColor='gray'
                      value={set} 
                      onChangeText={(text) => setSet(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Year: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Year'
                      placeholderTextColor='gray'
                      value={year} 
                      onChangeText={(text) => setYear(text)}
                      keyboardType='numeric'
                    />
                  </StyledView>
                </StyledView>
              </>
            )}

            {genre === 'Sports Memorabilia' && (
              <>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Athlete: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Athlete Name'
                      placeholderTextColor='gray'
                      value={athlete} 
                      onChangeText={(text) => setAthlete(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Team: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Team Name'
                      placeholderTextColor='gray'
                      value={team} 
                      onChangeText={(text) => setTeam(text)}
                    />
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className='text-lg'>Year: </StyledText>
                  <StyledView className='border-2 border-gray rounded-lg w-2/3 h-8'>
                    <StyledTextInput 
                      className='text-lg text-primary text-center font-bold justify-center shadow-sm mb-1' 
                      placeholder='Year'
                      placeholderTextColor='gray'
                      value={year} 
                      onChangeText={(text) => setYear(text)}
                      keyboardType='numeric'
                    />
                  </StyledView>
                </StyledView>
              </>
            )}

          </StyledView>
          <StyledView className='bg-gray mt-4 w-full h-px'/>
          <StyledView className='flex pl-4 pr-4 mt-4 w-full'>
            <StyledText className='text-2xl font-bold text-black'>Pricing</StyledText>
            <StyledView className='flex-row gap-x-4 mt-2 justify-between'>      
                <StyledPressable className={`${listingType==='auction' && 'bg-primary'} flex-1 border-2 border-black rounded-2xl active:bg-gray`} onPress={() => setListingType('auction')}>
                  <StyledText className={`${listingType==='auction' && 'text-white'} text-lg font-bold text-center`}>Auction</StyledText>
                </StyledPressable>
                <StyledPressable className={`${listingType==='fixed' && 'bg-primary'} flex-1 border-2 border-black rounded-2xl active:bg-gray`} onPress={() => setListingType('fixed')}>
                  <StyledText className={`${listingType==='fixed' && 'text-white'} text-lg font-bold text-center`}>Buy Now</StyledText>
                </StyledPressable>
            </StyledView>

              <>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                  <StyledText className='text-lg'>Price:</StyledText>
                  <StyledView className='flex-row items-center justify-end'>
                    <StyledText className='font-bold text-xl'>$ </StyledText>
                    <StyledView className='flex-row justify-center items-center border-2 border-gray rounded-lg w-1/2 h-8'>
                      <StyledTextInput 
                        className='text-xl text-primary text-center font-bold justify-center mb-1 shadow-sm w-full' 
                        placeholder='Price'
                        placeholderTextColor='gray'
                        value={price} 
                        onChangeText={(text) => setPrice(text)}
                        keyboardType='numeric'
                      />
                    </StyledView>
                  </StyledView>
                </StyledView>

                {listingType==='auction' && (
                  <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                    <StyledText className='text-lg'>Duration:</StyledText>
                    <StyledView className='flex-row items-center border-2 border-gray rounded-xl'>
                      <StyledTextInput 
                        className='text-xl text-center w-12 font-bold mb-1 shadow-sm text-primary'
                        value={duration} 
                        onChangeText={(text) => setDuration(text)} 
                        keyboardType="numeric" 
                      />
                      <StyledText className='text-lg mr-2 text-gray'>Day(s)</StyledText>
                    </StyledView>
                  </StyledView>
                )}
                <StyledView className="flex-row gap-x-4 mt-2 justify-between">
                  <StyledText className="text-lg">Allow Offers:</StyledText>
                  <StyledPressable className={`${offerable?'bg-primary':'border-2 border-gray'} flex justify-center items-center text-xl text-center w-8 h-8 ml-2 font-bold rounded-full active:bg-gray`} onPress={() => {setOfferable(!offerable)}}>
                    {offerable && (
                      <StyledImage source={icons.check} className='w-6 h-6'/>
                    )}
                  </StyledPressable>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                  <StyledText className={`${scheduled&&'font-bold'} text-lg`}>Schedule Start: </StyledText>
                  <StyledPressable className={`${scheduled?'bg-primary':'border-2 border-gray'} flex justify-center items-center text-xl text-center w-8 h-8 ml-2 font-bold rounded-full active:bg-gray`} onPress={() => {setScheduled(!scheduled)}}>
                    {scheduled && (
                      <StyledImage source={icons.check} className='w-6 h-6'/>
                    )}
                  </StyledPressable>
                </StyledView>
                {scheduled && (
                  <StyledView className='flex-row gap-x-4 mt-2 justify-between'>
                    <StyledView className='flex-row items-center'>
                      <StyledText className='text-lg'>Date:</StyledText>
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => setDate(selectedDate || date)}
                      />
                    </StyledView>
                    <StyledView className='flex-row items-center'>
                      <StyledText className='text-lg'>Time:</StyledText>
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={time}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedTime) => setTime(selectedTime || time)}
                      />
                    </StyledView>
                  </StyledView>
                )}
                 
              </>
          </StyledView>

          <StyledView className='bg-gray mt-4 w-full h-px'/>
          <StyledView className='flex pl-4 pr-4 mt-4 w-full'>
            <StyledText className='text-2xl font-bold text-black'>Shipping</StyledText>
            <StyledView className='flex-row gap-x-4 mt-2 justify-between'>      
                <StyledPressable className={`${shippingType==='variable' && 'bg-primary'} flex-1 border-2 border-black rounded-2xl active:bg-gray`} onPress={() => setShippingType('variable')}>
                  <StyledText className={`${shippingType==='variable' && 'text-white'} text-lg font-bold text-center`}>Variable</StyledText>
                </StyledPressable>
                <StyledPressable className={`${shippingType==='fixed' && 'bg-primary'} flex-1 border-2 border-black rounded-2xl active:bg-gray`} onPress={() => setShippingType('fixed')}>
                  <StyledText className={`${shippingType==='fixed' && 'text-white'} text-lg font-bold text-center`}>Fixed Rate</StyledText>
                </StyledPressable>
            </StyledView>

            {shippingType==='variable' && (
              <>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                  <StyledText className='text-lg'>Weight:</StyledText>
                  <StyledView className='flex-row items-center border-2 border-gray rounded-xl'>
                    <StyledTextInput 
                      className='text-xl text-center w-12 font-bold mb-1 shadow-sm text-primary'
                      value={weight} 
                      onChangeText={(text) => setWeight(text)} 
                      keyboardType="numeric" 
                    />
                    <StyledText className='text-lg mr-2 text-gray'>Oz(s)</StyledText>
                  </StyledView>
                </StyledView>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                  <StyledText className='text-lg'>Shipping Service:</StyledText>
                  <StyledPressable className='border-2 border-gray rounded-lg w-1/2 active:bg-gray' onPress={() => {setShippingModalVisible(true);}}>
                    {shippingProfile==='' ? (
                      <StyledText className='text-lg text-gray text-center font-bold'>Select Shipping</StyledText>
                    ):(
                      <StyledText className='pr-2 pl-2 text-lg text-primary text-center font-bold shadow-sm'>{shippingProfile}</StyledText>
                    )}
                  </StyledPressable>
                </StyledView>
              </>
            )}

            {shippingType==='fixed' && (
              <>
                <StyledText className='text-gray mt-1'>*Charge your buyer a flat shipping cost. If the amount is less than the shipping cost, you pay the difference. Choose this option to use your own shipping labels or offer your buyers discounted shipping.</StyledText>
                <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                    <StyledText className='text-lg'>Buyer Pays:</StyledText>
                    <StyledView className='flex-row items-center justify-end'>
                      <StyledText className='font-bold text-xl'>$ </StyledText>
                      <StyledView className='flex-row justify-center items-center border-2 border-gray rounded-lg w-1/2 h-8'>
                        <StyledTextInput 
                          className='text-xl text-primary text-center font-bold justify-center mb-1 shadow-sm w-full' 
                          placeholder=''
                          placeholderTextColor='gray'
                          value={shippingCost} 
                          onChangeText={(text) => setShippingCost(text)}
                          keyboardType='numeric'
                        />
                      </StyledView>
                    </StyledView>
                  </StyledView>
              </>
            )}
          </StyledView>


          <StyledView className='bg-gray mt-4 w-full h-px'/>
          <StyledView className='flex pl-4 pr-4 mt-4 w-full items-center'>
            <StyledPressable 
              onPressIn={handlePressIn}
              onPressOut={handlePressOut} 
              disabled={uploading} 
              className='flex overflow-hidden items-center w-full border-2 border-black bg-primary rounded-full'>
              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: '#00FF00', // Green color
                  width: animatedWidth, // Animate the width
                }}
              />
              <StyledText className='text-3xl font-bold text-white p-2'>Create Listing</StyledText>
            </StyledPressable>
          </StyledView>
          <StyledView className='w-full h-24'/>

          <CategoryModal visible={categoryModalVisible}
            onClose={() => {setCategoryModalVisible(false);}}
            onSelectCategory={(category: string, selectedGenre: string) => handleCategorySelect(category, selectedGenre)}
          />

          <BrandModal 
            visible={brandModalVisible}
            onClose={() => {setBrandModalVisible(false);}}
            onSelectBrand={(brand: string) => handleBrandSelect(brand)}
          />

          <FeaturesModal
            visible={featuresModalVisible}
            onClose={() => {setFeaturesModalVisible(false);}}
            onSelectFeatures={(features:string[]) => handleFeaturesSelect(features)}
          />

          <ShippingModal
            visible={shippingModalVisible}
            onClose={() => {setShippingModalVisible(false);}} 
            onSelectShipping={(shipping:string) => handleShippingSelect(shipping)}
          />

          <UploadingModal
            visible={uploading}
            progress={uploadProgress}
            listingUrl={listingUrl}
            onClose={() => {setUploading(false);}}
          />

        </StyledScrollView>
      </StyledView>
    </StyledView>

  );
};

export default CreateListing;