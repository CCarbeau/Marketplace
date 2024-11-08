import { View, Text, Pressable, Image, Alert, ScrollView, ImageBackground, Animated, useWindowDimensions, FlatList, ActivityIndicator, RefreshControl, Modal, TextInput } from 'react-native';
import { styled } from 'nativewind';
import React, { useState, useEffect, useRef } from 'react';
import { signOut, getAuth, onAuthStateChanged, User, signInWithCustomToken } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, list } from 'firebase/storage';
import { storage } from '../../../src/auth/firebaseConfig'
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Listing, Seller, Review } from '@/types/interfaces';
import * as ImagePicker from 'expo-image-picker';

import icons from '@/constants/icons'

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledView = styled(View);
const StyledImage = styled(Image);
const StyledImageBackground = styled(ImageBackground);
const StyledTextInput = styled(TextInput);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const edit = () => {
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const auth = getAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [otherProf, setOtherProf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const layout = useWindowDimensions();

  // Check stored token and initialize sellerId
  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const isValid = await verifyTokenWithBackend(token);
          if (isValid) {
            setSignedIn(true);
            const decodedToken = jwtDecode<JwtPayload & { user_id?: string }>(token);
            const userId = decodedToken.user_id || decodedToken.sub;
            if (userId) {
              setSellerId(userId);
            }
          } else {
            await handleExpiredOrInvalidToken(token);
          }
        }
      } catch (error) {
        console.error('Error checking stored token:', error);
      }
    };

    const handleExpiredOrInvalidToken = async (token: string) => {
      const decodedToken = jwtDecode<JwtPayload & { exp?: number }>(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const newToken = await currentUser.getIdToken(true);
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.setItem('userToken', newToken);
            setSignedIn(true);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            await AsyncStorage.removeItem('userToken');
            setSignedIn(false);
          }
        } else {
          await AsyncStorage.removeItem('userToken');
          setSignedIn(false);
        }
      } else {
        await AsyncStorage.removeItem('userToken');
        setSignedIn(false);
      }
    };

    const verifyTokenWithBackend = async (token: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!response.ok) {
          throw new Error('Token verification failed');
        }
        const data = await response.json();
        return data.valid;
      } catch (error) {
        console.error('Error verifying token with backend:', error);
        return false;
      }
    };

    if(!otherProf){
      checkStoredToken();
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user && !otherProf) {
        const idToken = await user.getIdToken();
        await AsyncStorage.setItem('userToken', idToken);
        setSignedIn(true);
        setSellerId(user.uid);
      } else {
        setSignedIn(false);
        setSellerId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/sellers/fetch-seller?id=${sellerId}`, {
          method: 'GET',
        });
  
        if (!response.ok) {
          throw new Error(`Error fetching seller: ${response.status}`);
        }
  
        const data = await response.json();
        setSeller(data.seller);
        setUsername(data.seller.username);
        setName(data.seller?.name);
        setDescription(data.seller?.description);
      } catch (error) {
        console.log('Cannot fetch seller', error);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSeller();
    }
  }, [sellerId]);

  const [changedImage, setChangedImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerImageDownload, setBannerImageDownload] = useState<string | null>(null);
  const [pfpImage, setPfpImage] = useState<string | null>(null);
  const [pfpImageDownload, setPfpImageDownload] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleSaveChanges = async () => {
    const uploadedImageRefs: any[] = [];

    const uploadBannerImage = async () => {
      if (bannerImage != null) {
        console.log("Attempting to read file at URI:", bannerImage);

        let downloadURL;
    
        // Create blob from the file URI
        const blob: Blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", bannerImage, true);
          xhr.send(null);
        });
    
        const filename = bannerImage.substring(bannerImage.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `images/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);
    
        // Use a Promise to wait for the upload to finish
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            // Progress observer
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            // Error observer
            (error) => {
              console.error('Banner upload error:', error);
              Alert.alert('Upload failed!', 'Please try again.');
              reject(error);
            },
            // Completion observer
            async () => {
              try {
                downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(downloadURL);
                uploadedImageRefs.push(downloadURL);  // Add to your image references
                resolve()
              } catch (error) {
                console.error('Error getting banner download URL:', error);
                Alert.alert('Error', 'Failed to retrieve banner download URL.');
                reject(error);
              }
            }
          );
        });
        
        return downloadURL;
      }
    };
    

    const uploadProfileImage = async () => {
      if (pfpImage != null) {
        console.log("Attempting to read file at URI:", pfpImage);

        let downloadURL;
    
        // Create blob from the file URI
        const blob: Blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", pfpImage, true);
          xhr.send(null);
        });
    
        const filename = pfpImage.substring(pfpImage.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `images/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);
    
        // Use a Promise to wait for the upload to finish
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            // Progress observer
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            // Error observer
            (error) => {
              console.error('Banner upload error:', error);
              Alert.alert('Upload failed!', 'Please try again.');
              reject(error);
            },
            // Completion observer
            async () => {
              try {
                downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log(downloadURL);
                uploadedImageRefs.push(downloadURL);  // Add to your image references
                resolve()
              } catch (error) {
                console.error('Error getting banner download URL:', error);
                Alert.alert('Error', 'Failed to retrieve banner download URL.');
                reject(error);
              }
            }
          );
        });
        
        return downloadURL;
      }
    };

    const deleteUploadedImages = async () => {
      for (const storageRef of uploadedImageRefs) {
        try {
          await deleteObject(storageRef);
          console.log('Deleted uploaded image from storage:', storageRef.fullPath);
        } catch (deleteError) {
          console.error('Failed to delete image from storage:', deleteError);
        }
      }
    }

    let bannerDownloadURL;
    let pfpDownloadURL;
    try{
      bannerDownloadURL = await uploadBannerImage();
      pfpDownloadURL= await uploadProfileImage(); 
    }catch {
      console.log('called');
      await deleteUploadedImages();
    }

    const docData = {
      sellerId: sellerId,
      ...(bannerImage != null && bannerDownloadURL != null &&{
        banner: bannerDownloadURL,
      }),
      ...(pfpImage != null && pfpDownloadURL != null && {
        pfp: pfpDownloadURL,
      }),
      ...(seller?.username != username && {
        username: username
      }),
      ...(seller?.name != name && {
        name: name
      }),
      ...(seller?.description != description && {
        description: description,
      })
    }

    console.log('api request called');

    const response = await fetch(`${API_URL}/sellers/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(docData),
    })

    if (!response.ok) {
      const errorData = await response.json();
      deleteUploadedImages();
      console.error('Backend error:', errorData.error);
      throw new Error(errorData.error || 'Failed to update profile.');
    }
  }

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      if(changedImage === 'Banner'){
        setBannerImage(pickerResult.assets[0].uri); 
      } else {
        setPfpImage(pickerResult.assets[0].uri);
      }
      setModalVisible(false); // Close the modal after selection
    }
  };

  if(loading){
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF5757" />
      </StyledView>
    )
  }

  return (
    <ScrollView>
      <StyledView className='w-full'>
        <StyledPressable onPress={() => {setModalVisible(true); setChangedImage('Banner')}} className='w-full h-48 bg-primary active:bg-gray rounded items-center'>
          <StyledImageBackground source={{ uri: bannerImage || seller?.banner }} className='w-full h-full items-center justify-center'>
            {bannerImage == null && seller?.banner == null  && (
              <StyledImage source={icons.camera} className='w-12 h-12'/>
            )}
          </StyledImageBackground>
        </StyledPressable>
        <StyledView className='flex-row ml-4 mr-4 mt-4'>
          <StyledPressable onPress={() => {setModalVisible(true); setChangedImage('Profile')}} className='w-24 h-24 border items-center justify-center rounded-full bg-gray active:bg-darkGray'>
            <StyledImageBackground source={{uri: pfpImage || seller?.pfp}} className='w-full h-full items-center justify-center' imageStyle={{borderRadius:48}}/>
              {pfpImage == null && seller?.pfp == null  && (
                <StyledImage source={icons.camera} className='absolute w-12 h-12'/>
              )}
          </StyledPressable>
          <StyledView className='flex-1 flex ml-2 mr-0 justify-center'>
            <StyledTextInput
              className='border border-gray rounded-xl w-full text-md p-2 font-bold focus:border-primary self-center'
              placeholder='Username'
              placeholderTextColor='gray'
              value={username}
              onChangeText={(text) => setUsername(text)}
              autoCapitalize="none"
            />
            <StyledTextInput
              className='border border-gray rounded-xl w-full text-md p-2 mt-2 focus:border-primary self-center'
              placeholder='Name'
              placeholderTextColor='gray'
              value={name}
              onChangeText={(text) => setName(text)}
            />
            
          </StyledView>
        </StyledView>
        <StyledView className='ml-4 mr-4 mt-2'>
          <StyledTextInput 
            className='border border-gray rounded-xl w-full text-md pt-2 pr-2 pl-2 pb-12 mt-2 focus:border-primary self-center'
            placeholder='Description'
            placeholderTextColor='gray'
            value={description}
            onChangeText={(text) => setDescription(text)}
          />
          <StyledPressable onPress={() => {handleSaveChanges; router.back();}} className='rounded-xl p-3 bg-primary active:bg-primaryDark mt-4 items-center'>
            <StyledText className='text-white font-bold'>Save Changes</StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>

      {/* Modal for choosing image */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <StyledView className="flex-1 justify-center items-center bg-black/50">
          <StyledView className="w-4/5 p-5 bg-white rounded-lg items-center">
            <StyledText className="text-lg mb-4">Choose a {changedImage} Image</StyledText>
            <StyledPressable onPress={() => openImagePicker()} className="p-4 bg-primary active:bg-primaryDark rounded-xl mb-2">
              <StyledText className="text-white">Choose from Library</StyledText>
            </StyledPressable>
            <StyledPressable onPress={() => setModalVisible(false)} className="p-4 bg-gray active:bg-darkGray rounded-xl">
              <StyledText className="text-white">Cancel</StyledText>
            </StyledPressable>
          </StyledView>
        </StyledView>
      </Modal>
    </ScrollView>
  );
};

export default edit;