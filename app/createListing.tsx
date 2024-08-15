import React, { useState } from 'react';
import { View, Pressable, Image, Alert, TextInput, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebaseConfig';
import { doc, setDoc } from "firebase/firestore"; 
import { styled } from 'nativewind';

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
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDes] = useState('');
  const [price, setPrice] = useState('');

  const StyledPressable = styled(Pressable)
  const StyledImage = styled(Image)
  const StyledView = styled(View)
  const StyledText = styled(Text)
  
  const ownerUID = auth.currentUser?.uid

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (image == null) {
      Alert.alert("Please select an image first!");
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = image.substring(image.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `images/${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Handle progress, if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error('Upload failed:', error);
          Alert.alert('Upload failed!', error.message);
          setUploading(false);
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at', downloadURL);
            Alert.alert('Upload successful!', 'Image URL: ' + downloadURL);
            
            // Generate a unique document ID for the new listing
            const newDocRef = doc(db, "listings");

            // Now update the Firestore database with the image URL and other details
            await setDoc(newDocRef, {
              title: title,
              description: description,
              price: price,
              images: [downloadURL],  
              likes: 0,               
              offerable: true,        
              ownerUID: auth.currentUser?.uid 
            });

            setUploading(false);
          } catch (error) {
            console.error('Error getting download URL:', error);
            Alert.alert('Error', 'Failed to retrieve download URL.');
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
      setUploading(false);
    }
  };
  if(!ownerUID){
    return (
      <StyledText>Not signed in</StyledText>
    )
  }

  return (
    <StyledView className='alignItems-center justifyContent-center flex-1'>
        <TextInput placeholder='Title' value={title} onChangeText={(text) => setTitle(text)} />
        <TextInput placeholder='Description' value={description} onChangeText={(text) => setDes(text)} />
        <TextInput placeholder='Price' value={price} onChangeText={(text) => setPrice(text)} keyboardType='numeric' />
        <StyledPressable onPress={pickImage}>
            <StyledText>Pick an image from camera roll</StyledText>
        </StyledPressable>
        {image && <StyledImage source={{ uri: image }} className='w-200 h-200' />}
        <StyledPressable onPress={uploadImage} disabled={uploading}>
            <StyledText>Upload Image</StyledText>
        </StyledPressable>
    </StyledView>
  );
};

export default CreateListing;