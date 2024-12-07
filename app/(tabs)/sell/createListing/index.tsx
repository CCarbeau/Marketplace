import React, { useState, useRef } from 'react';
import { View, Pressable, Image, Alert, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
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
import GradeModal from './grade';
import GraderModal from './grader';
import QualityModal from './quality';

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)
const StyledImageBackground = styled(ImageBackground)
const StyledTextInput = styled(TextInput)

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Grader = 'PSA' | 'BGS' | 'SGC' | 'Arena Club' | 'CGC' | 'CSG' | 'HGA' | 'KSA' | 'Rare Edition' | 'TAG' | 'Other' | '';

const { width: screenWidth } = Dimensions.get('window');

const CreateListing = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageIndex, setImageIndex]= useState(0);
  const [graderModalVisible, setGraderModalVisible] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [qualityModalVisible, setQualityModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [featuresModalVisible, setFeaturesModalVisible] = useState(false);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));
  
  const [condition, setCondition] = useState('');
  const [grader, setGrader] = useState('');
  const [grade, setGrade] = useState('');
  const [certNum, setCertNum] = useState('');
  const [quality, setQuality] = useState('');
  const [category, setCategory] = useState('');
  const [genre, setGenre] = useState('')
  const [title, setTitle] = useState('');
  const [description, setDes] = useState('');
  const [price, setPrice] = useState('');
  const [quantity,setQuantity] = useState('1');
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

    if(condition === ''){
      Alert.alert("A condition is required");
      return;
    }

    if(condition === 'graded'){
      if(grader === ''){
        Alert.alert("A grader is required");
        return;
      }
      if(grade === ''){
        Alert.alert("A grade is required");
        return;
      }
    }

    if(condition === 'ungraded'){
      if(quality === ''){
        Alert.alert("A quality is required");
        return;
      }
    }

    if(condition === ''){
      Alert.alert("A condition is required");
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
        condition,
        ...(condition === 'graded' && grader ? { grader } : {}),
        ...(condition === 'graded' && grade ? { grade } : {}),
        ...(condition === 'graded' && includeIfDefined('certificationNumber', certNum)),
        ...(condition === 'ungraded' && quality ? { quality } : {}),
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

        const response = await fetch(`${API_URL}/listings/add-listing`,{
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

  const handleGraderSelect = (selectedGrader: string) => {
    setGrader(selectedGrader); 
    setGrade('');
  };

  const handleGradeSelect = (selectedGrade: string) => {
    setGrade(selectedGrade); 
  };

  const handleQualitySelect = (selectedQuality: string) => {
    setQuality(selectedQuality); 
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
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={144}
      >
        <StyledView className={'bg-white flex-1 h-full w-full'}>
          <StyledScrollView className='w-full'>
            <StyledView className='h-96'>
              <StyledScrollView className='flex-1 h-full' horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleImageScroll} scrollEventThrottle={16}>
                {images.map((imageUri, index) => (
                    <StyledImageBackground
                      key={index}
                      source={{ uri: imageUri }}
                      className="h-96"
                      style={{ width: screenWidth }}
                    >
                      <StyledPressable className='flex justify-center items-center absolute top-8 right-4 w-8 h-8 bg-black rounded-full active:bg-gray' onPress={handleDelete} style={{ zIndex: 10 }}>
                        <StyledImage source={icons.trash} className='w-5 h-5'></StyledImage>
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
            <StyledView className='flex w-full pl-4 pr-4'>
              <StyledTextInput 
                className='text-xl font-bold mt-2 text-wrap' 
                placeholder='Title' 
                value={title} 
                onChangeText={(text) => setTitle(text)} 
                style={{lineHeight: 24}}
                maxLength={75}
                multiline={true}
              />
              <StyledTextInput 
                className='text-darkGray text-left mt-1' 
                placeholder='Description' 
                value={description} 
                onChangeText={(text) => setDes(text)} 
                maxLength={150}
                multiline={true}
              />
              <StyledView className='flex flex-row items-center mt-4'>
                <StyledText className='text-xl font-bold'>$</StyledText>
                <StyledTextInput 
                  className='ml-1 font-bold' 
                  style={{fontSize: 20}}
                  placeholder='Price' 
                  value={price} 
                  onChangeText={(text) => setPrice(text)} 
                  keyboardType='numeric' 
                />
                <StyledText className='text-gray pl-2'>+ shipping & taxes</StyledText>
              </StyledView>
              <StyledView className="flex flex-row items-center justify-between">
                <StyledView className="flex flex-row items-center">
                  <StyledText className='text-lg'>Quantity:</StyledText>
                  <StyledView className='border-2 border-gray rounded-xl ml-2'>
                    <StyledTextInput 
                      className="text-center w-12 pt-2 pb-2 -ml-1 -mr-1 font-bold"
                      style={{fontSize: 16}}
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
              <StyledText className='text-xl font-bold text-black'>Details</StyledText>
              <StyledView className="flex-row justify-between items-center">
                  <StyledText className="text-lg w-24 text-right mr-4">
                    Condition:
                  </StyledText>
                  <StyledView className="flex-1 flex-row justify-between gap-x-2">
                    <StyledPressable
                      className={`flex-1 rounded-lg border-2 h-8 items-center justify-center active:opacity-50 ${condition === 'graded' && ('bg-primary border-primary')}`}
                      onPress={() => {
                        setCondition('graded');
                      }}
                    >
                      <StyledText className={`font-bold ${condition === 'graded' && ('text-white')}`}>
                        Graded
                      </StyledText>
                    </StyledPressable>
                    <StyledPressable
                      className={`flex-1 rounded-lg border-2 h-8 items-center justify-center active:opacity-50 ${condition === 'ungraded' && ('bg-primary border-primary')}`}
                      onPress={() => {
                        setCondition('ungraded');
                      }}
                    >
                      <StyledText className={`font-bold ${condition === 'ungraded' && ('text-white')}`}>
                        Ungraded
                      </StyledText>
                    </StyledPressable>
                  </StyledView>
                </StyledView>
                {condition === 'graded' ? (
                  <>
                    <StyledView className='flex-row mt-2 justify-between items-center'>
                      <StyledText className='text-right w-24 mr-4'>Grader:</StyledText>
                      <StyledPressable className='flex-1 border-2 border-gray rounded-lg active:opacity-50 justify-center h-8' onPress={() => {setGraderModalVisible(true);}}>
                        {grader==='' ? (
                          <StyledText className='text text-gray text-center font-bold'>Select Grader</StyledText>
                        ):(
                          <StyledText className='text-primary text-center font-bold shadow-sm'>{grader}</StyledText>
                        )}
                      </StyledPressable>
                    </StyledView>

                    {grader !== '' && (
                      <>
                        <StyledView className='flex-row mt-2 justify-between items-center'>
                          <StyledText className='text-right w-24 mr-4'>Grade:</StyledText>
                          <StyledPressable className='flex-1 border-2 border-gray rounded-lg active:opacity-50 justify-center h-8' onPress={() => {setGradeModalVisible(true);}}>
                            {grade==='' ? (
                              <StyledText className='text text-gray text-center font-bold'>Select Grade</StyledText>
                            ):(
                              <StyledText className='text-primary text-center font-bold shadow-sm'>{grade}</StyledText>
                            )}
                          </StyledPressable>
                        </StyledView>
                        <StyledView className='flex-row mt-2 justify-between items-center'>
                          <StyledText className='text-right w-24 mr-4'>Cert. Number:</StyledText>
                          <StyledTextInput 
                            className='flex-1 border-2 border-gray rounded-lg focus:border-primary justify-center h-8 text text-primary text-center font-bold' 
                            placeholder='Certification Number (Optional)'
                            maxLength={20}
                            value={certNum}
                            onChangeText={(text) => {setCertNum(text)}}
                            keyboardType='numeric'
                          >
                          
                          </StyledTextInput>
                        </StyledView>
                      </>
                    )}
                  </>
                ) : condition === 'ungraded' ? (
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Quality:</StyledText>
                    <StyledPressable className='flex-1 border-2 border-gray rounded-lg active:opacity-50 justify-center h-8' onPress={() => {setQualityModalVisible(true);}}>
                      {quality==='' ? (
                        <StyledText className='text text-gray text-center font-bold'>Select Quality</StyledText>
                      ):(
                        <StyledText className='text-primary text-center font-bold shadow-sm'>{quality}</StyledText>
                      )}
                    </StyledPressable>
                  </StyledView>
                ) : (
                  <></>
                )}
              <StyledView className='flex-row mt-2 justify-between'>
                <StyledText className='text-lg w-24 text-right mr-4'>Category:</StyledText>
                <StyledPressable className='flex-1 border-2 border-gray rounded-lg active:opacity-50 justify-center h-8' onPress={() => {setCategoryModalVisible(true);}}>
                  {category==='' ? (
                    <StyledText className='text text-gray text-center font-bold'>Select Category</StyledText>
                  ):(
                    <StyledText className='text-primary text-center font-bold shadow-sm'>{category}</StyledText>
                  )}
                </StyledPressable>
              </StyledView>

              {category.slice(-7)==='Singles' && genre==='Sports Cards' && (
                <>
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Athlete:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg min-h-8 justify-center' style={{minHeight: 32}}>
                      <StyledTextInput 
                        className='text-primary font-bold text-center shadow-sm' 
                        placeholder='Athlete Name'
                        placeholderTextColor='gray'
                        value={athlete} 
                        onChangeText={(text) => setAthlete(text)}
                        maxLength={50}
                      />
                    </StyledView>
                  </StyledView>
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Team:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg justify-center' style={{minHeight: 32}}>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Team Name'
                        placeholderTextColor='gray'
                        value={team} 
                        onChangeText={(text) => setTeam(text)}
                        maxLength={50}
                      />
                    </StyledView>
                  </StyledView>
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Year:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg justify-center' style={{minHeight: 32}}>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Year'
                        placeholderTextColor='gray'
                        value={year} 
                        onChangeText={(text) => setYear(text)}
                        keyboardType='numeric'
                        maxLength={10}
                      />
                    </StyledView>
                  </StyledView>

                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Brand:</StyledText>
                    <StyledPressable 
                      className='flex-1 border-2 border-gray rounded-lg h-8 justify-center active:bg-gray'
                      onPress={() => setBrandModalVisible(true)}
                    >
                      {brand === '' ? (
                        <StyledText className='text-md text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                      ) : (
                        <StyledText className='text-md text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                      )}
                    </StyledPressable>
                  </StyledView>

                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Set:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg justify-center' style={{minHeight: 32}}>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold shadow-sm' 
                        placeholder='Set Name'
                        placeholderTextColor='gray'
                        value={set}
                        onChangeText={(text) => setSet(text)}
                        maxLength={50}
                      />
                    </StyledView>
                  </StyledView>

                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Features:</StyledText>
                    <StyledPressable 
                      className='flex-1 border-2 border-gray rounded-lg min-h-8 justify-center active:bg-gray'
                      onPress={() => setFeaturesModalVisible(true)}
                      style={{minHeight: 32}}
                    >
                      {features.length === 0 ? (
                        <StyledText className='text-md text-gray text-center font-bold shadow-sm'>Select Features</StyledText>
                      ) : (
                        <StyledText className='text-md text-primary text-center font-bold shadow-sm'>{features.join(', ')}</StyledText>
                      )}
                    </StyledPressable>
                  </StyledView>

                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Parallel:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg min-h-8 justify-center' style={{minHeight: 32}}>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Parallel Name'
                        placeholderTextColor='gray'
                        value={parallel} 
                        onChangeText={(text) => setParallel(text)}
                        maxLength={25}
                      />
                    </StyledView>
                  </StyledView>

                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Print Run:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg justify-center' style={{minHeight: 32}}>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
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
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Cards in Lot:</StyledText>
                    <StyledView className='flex-row items-center border-2 border-gray rounded-lg h-8'>
                      <StyledTextInput 
                        className='text-center w-12 font-bold shadow-sm text-primary'
                        style={{ fontSize: 16 }}
                        value={cardsInLot} 
                        onChangeText={(text) => setCardsInLot(text)} 
                        keyboardType="numeric" 
                      />
                      <StyledText className='text-md text-gray pr-2'>Cards</StyledText>
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Athletes:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Athlete Names'
                        placeholderTextColor='gray'
                        value={athlete} 
                        onChangeText={(text) => setAthlete(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Teams:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Team Names'
                        placeholderTextColor='gray'
                        value={team} 
                        onChangeText={(text) => setTeam(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Year:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Year'
                        placeholderTextColor='gray'
                        value={year} 
                        onChangeText={(text) => setYear(text)}
                        keyboardType='numeric'
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Brand:</StyledText>
                    <StyledPressable 
                      className='flex-1 border-2 border-gray rounded-lg h-8 justify-center active:bg-gray'
                      onPress={() => setBrandModalVisible(true)}
                    >
                      {brand === '' ? (
                        <StyledText className='text-md text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                      ) : (
                        <StyledText className='text-md text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                      )}
                    </StyledPressable>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Set:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Set Name'
                        placeholderTextColor='gray'
                        value={set} 
                        onChangeText={(text) => setSet(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Features:</StyledText>
                    <StyledPressable 
                      className='flex-1 border-2 border-gray rounded-lg h-8 justify-center active:bg-gray'
                      onPress={() => setFeaturesModalVisible(true)}
                    >
                      {features.length === 0 ? (
                        <StyledText className='text-md text-gray text-center font-bold shadow-sm'>Select Features</StyledText>
                      ) : (
                        <StyledText className='text-md text-primary text-center font-bold shadow-sm'>{features.join(', ')}</StyledText>
                      )}
                    </StyledPressable>
                  </StyledView>
                </>            
              )}

              {category.slice(-3)==='Wax' && genre==='Sports Cards' && (
                <>
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Brand:</StyledText>
                    <StyledPressable 
                      className='flex-1 border-2 border-gray rounded-lg h-8 justify-center active:bg-gray'
                      onPress={() => setBrandModalVisible(true)}
                    >
                      {brand === '' ? (
                        <StyledText className='text-md text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                      ) : (
                        <StyledText className='text-md text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                      )}
                    </StyledPressable>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Set:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Set Name'
                        placeholderTextColor='gray'
                        value={set} 
                        onChangeText={(text) => setSet(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Year:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
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
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Athlete(s):</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Athlete Names'
                        placeholderTextColor='gray'
                        value={athlete} 
                        onChangeText={(text) => setAthlete(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Team(s):</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Team Names'
                        placeholderTextColor='gray'
                        value={team} 
                        onChangeText={(text) => setTeam(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Brand:</StyledText>
                    <StyledPressable 
                      className='flex-1 border-2 border-gray rounded-lg h-8 justify-center active:bg-gray'
                      onPress={() => setBrandModalVisible(true)}
                    >
                      {brand === '' ? (
                        <StyledText className='text-md text-gray text-center font-bold shadow-sm'>Select Brand</StyledText>
                      ) : (
                        <StyledText className='text-md text-primary text-center font-bold shadow-sm'>{brand}</StyledText>
                      )}
                    </StyledPressable>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Set:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Set Name'
                        placeholderTextColor='gray'
                        value={set} 
                        onChangeText={(text) => setSet(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Year:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
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
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Athlete:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Athlete Name'
                        placeholderTextColor='gray'
                        value={athlete} 
                        onChangeText={(text) => setAthlete(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Team:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
                        placeholder='Team Name'
                        placeholderTextColor='gray'
                        value={team} 
                        onChangeText={(text) => setTeam(text)}
                      />
                    </StyledView>
                  </StyledView>
                
                  <StyledView className='flex-row mt-2 justify-between items-center'>
                    <StyledText className='text-right w-24 mr-4'>Year:</StyledText>
                    <StyledView className='flex-1 border-2 border-gray rounded-lg h-8 justify-center'>
                      <StyledTextInput 
                        className='text-md text-primary text-center font-bold justify-center shadow-sm' 
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
              <StyledText className='text-xl font-bold text-black'>Pricing</StyledText>
              <StyledView className='flex-row gap-x-4 mt-2 justify-between'>      
                  <StyledPressable className={`${listingType==='auction' && 'bg-primary border-primary'} flex-1 border-2 rounded-2xl active:bg-gray`} onPress={() => setListingType('auction')}>
                    <StyledText className={`${listingType==='auction' && 'text-white'} font-bold text-center p-2`}>Auction</StyledText>
                  </StyledPressable>
                  <StyledPressable className={`${listingType==='fixed' && 'bg-primary border-primary'} flex-1 border-2 rounded-2xl active:bg-gray`} onPress={() => setListingType('fixed')}>
                    <StyledText className={`${listingType==='fixed' && 'text-white'} font-bold text-center p-2`}>Buy Now</StyledText>
                  </StyledPressable>
              </StyledView>

                <>
                  <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                    <StyledText className='text-lg'>Price:</StyledText>
                    <StyledView className='flex-row items-center justify-end'>
                      <StyledText className='font-bold text-xl'>$ </StyledText>
                      <StyledView className='flex-row justify-center items-center border-2 border-gray rounded-lg w-1/2 h-8'>
                        <StyledTextInput 
                          className='text-primary text-center font-bold shadow-sm h-8 w-full' 
                          style={{fontSize:16}}
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
                          className='text-center w-12 font-bold shadow-sm text-primary'
                          style={{fontSize: 16}}
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
              <StyledText className='text-xl font-bold text-black'>Shipping</StyledText>
              <StyledView className='flex-row gap-x-4 mt-2 justify-between'>      
                  <StyledPressable className={`${shippingType==='variable' && 'bg-primary border-primary'} flex-1 border-2 rounded-2xl active:bg-gray`} onPress={() => setShippingType('variable')}>
                    <StyledText className={`${shippingType==='variable' && 'text-white'}  font-bold text-center p-2`}>Variable</StyledText>
                  </StyledPressable>
                  <StyledPressable className={`${shippingType==='fixed' && 'bg-primary border-primary'} flex-1 border-2 rounded-2xl active:bg-gray`} onPress={() => setShippingType('fixed')}>
                    <StyledText className={`${shippingType==='fixed' && 'text-white'} font-bold text-center p-2`}>Fixed Rate</StyledText>
                  </StyledPressable>
              </StyledView>

              {shippingType==='variable' && (
                <>
                  <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                    <StyledText className='text-lg'>Weight:</StyledText>
                    <StyledView className='flex-row items-center border-2 border-gray rounded-xl'>
                      <StyledTextInput 
                        className='text-center w-12 font-bold shadow-sm text-primary'
                        style={{fontSize: 16}}
                        value={weight} 
                        onChangeText={(text) => setWeight(text)} 
                        keyboardType="numeric" 
                      />
                      <StyledText className='text-lg mr-2 text-gray'>Oz(s)</StyledText>
                    </StyledView>
                  </StyledView>
                  <StyledView className='flex-row gap-x-4 mt-2 justify-between items-center'>
                    <StyledText className='text-lg'>Shipping Service:</StyledText>
                    <StyledPressable className='border-2 border-gray rounded-lg w-1/2 active:bg-gray h-8 justify-center' onPress={() => {setShippingModalVisible(true);}}>
                      {shippingProfile==='' ? (
                        <StyledText className='text-gray text-center font-bold'>Select Shipping</StyledText>
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
                            className='text-primary text-center font-bold justify-center shadow-sm w-full' 
                            placeholder='Cost'
                            placeholderTextColor='gray'
                            style={{fontSize: 16}}
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
                className='flex overflow-hidden items-center w-full border-2 border-black bg-primary active:bg-primaryDark rounded-full'>
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: '#22FF22', // Green color
                    width: animatedWidth, // Animate the width
                  }}
                />
                <StyledText className='text-xl font-bold text-white p-2'>Create Listing</StyledText>
              </StyledPressable>
            </StyledView>
            <StyledView className='w-full h-24'/>

            <GraderModal
              visible={graderModalVisible}
              onClose={() => {setGraderModalVisible(false);}}
              onSelectGrader={(grader: string) => handleGraderSelect(grader)}
            />

            <GradeModal
              visible={gradeModalVisible}
              grader={grader}
              onClose={() => {setGradeModalVisible(false);}}
              onSelectGrade={(grade: string) => handleGradeSelect(grade)}
            />

            <QualityModal
              visible={qualityModalVisible}
              onClose={() => {setQualityModalVisible(false);}}
              onSelectQuality={(quality: string) => handleQualitySelect(quality)}
            />

            <CategoryModal 
              visible={categoryModalVisible}
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
              selectedFeatures={features}
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
      </KeyboardAvoidingView>
    </StyledView>
  );
};

export default CreateListing;