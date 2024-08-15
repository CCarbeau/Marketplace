import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ImageBackground, FlatList, Dimensions, Alert, Animated, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { styled } from 'nativewind';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebaseConfig'; // Import your storage instance
import { LinearGradient } from 'expo-linear-gradient';
import icons from '../../../../constants/icons';

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

const Index = () => {
  const StyledPressable = styled(Pressable)
  const StyledImage = styled(Image)
  const StyledView = styled(View)
  const StyledText = styled(Text)
  const StyledImageBackground = styled(ImageBackground)

  const { height: screenHeight } = Dimensions.get('window');
  
  const isIOS = Platform.OS === 'ios';
  const tabBarHeight = isIOS ? 72 : 56;
  const imageBackgroundHeight = screenHeight - tabBarHeight;  
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const StyledButton = styled(Pressable)
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentListingIndex, setCurrentListingIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const auth = getAuth();

  const [user, setUser] = useState<User | null>(null); // `User` is the Firebase User type or null

  const fetchRandomListing = async () => {
    try {
      // Randomly select a document ID; adjust as needed for your use case
      // const docId = Math.floor(Math.random() * 2) + 2; 
      const docId = 1
      const docRef = doc(db, "listings", docId.toString());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data();
        const imageUrls = await Promise.all(docData.images.map(async (imagePath:string) => {
          const imageRef = ref(storage, imagePath);
          return await getDownloadURL(imageRef);
        }));

        setListings(prevListings => [...prevListings, { 
          id: docId, 
          urls: imageUrls, 
          title:docData["title"],
          description:docData["description"],
          price: docData["price"], 
          likes: docData["likes"],
          offerable: docData["offerable"],
          ownerUID: docData["ownerUID"],
          }]);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  const [progress] = useState(new Animated.Value(0));

  const handlePressIn = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1500, // 3 seconds for full color change
      useNativeDriver: false,
    }).start(({ finished }) => {
      if(finished){
        handlePurchase();
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

  // Interpolate the background color of the button
  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'], // Start at 0% width and grow to 100%
  });

  useEffect(() => {
    fetchRandomListing();  // Initial fetch
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [auth]);

  const handleLike = async (docId: number, currentLikes: number) => {
    if (user) {
      try {
        setIsLiked(!isLiked);
        const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
        const docRef = doc(db, "listings", docId.toString());
        
        await updateDoc(docRef, { likes: newLikes });
  
        // Update the local state to reflect the new like count
        setListings(prevListings =>
          prevListings.map(listing =>
            listing.id === docId ? { ...listing, likes: newLikes } : listing
          )
        );
      } catch (error) {
        console.error("Error updating likes:", error);
      }
    } else {
      router.push('signIn')
    }
  };

  const handleComment = () => {
    // Handle comment logic
  };

  const handleProfile = () => {
    // Handle profile logic
  };

  const handleFollow = () => {
    // Handle follow logic
  };

  const handlePurchase = () => {
    Alert.alert('purchase initiated')
  }

  const handleOffer = () => {

  }

  const handleLoadMore = () => {
    if (!loading) {
      setLoading(true);
      fetchRandomListing().then(() => setLoading(false));
    }
  };

  const handleImagePress = () => {
    setCurrentImageIndex((prevIndex) => {
      const currentListing = listings[0];
      const newIndex = prevIndex + 1;
      return newIndex < currentListing.urls.length ? newIndex : 0;
    });
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const imageUrl = item.urls[currentImageIndex];
    const likes = item.likes;
    const price = item.price;


    return (
      <Pressable onPress={handleImagePress} style={{ height: screenHeight }}>
        <StyledImageBackground source={{ uri: imageUrl }} style={{height: imageBackgroundHeight, flex: 1, width: '100%'}}>
          <StyledView className='w-full h-36'>
            <LinearGradient 
              colors={['#222222', 'transparent']} 
              start={{ x: 0.5, y: 0 }} // Gradient start point
              end={{ x: 0.5, y: 1 }}   // Gradient end point
              style={{ flex: 1, justifyContent: 'center'}}
            >
              <StyledPressable className='absolute right-4 bottom-8' onPress={() => router.push('(tabs)/home/(tabs)/messages')}>
                <StyledImage 
                  source={icons.message} 
                  className='h-8 w-8'
                />
              </StyledPressable>
            </LinearGradient>
          </StyledView>

          <StyledView className='absolute mt-96 right-4 z-10'>
            <Pressable onPress={() => handleLike(item.id, likes)}>
              <StyledImage source={isLiked ? icons.heartFull : icons.heartEmpty} className='w-12 h-12' />
              <StyledText className='p-2 text-white text-center'>{likes}</StyledText>
            </Pressable>

            <Pressable onPress={handleComment}>
              <StyledImage source={icons.message} className="w-12 h-12" />
            </Pressable>

            <Pressable onPress={handleProfile}>
              <StyledImage source={icons.circle} className='mt-6 h-12 w-12'/>
            </Pressable>

            <StyledButton style={{ marginTop: 4, borderColor: 'white', borderWidth: 2, borderRadius: 16 }} onPress={handleFollow}>
              <StyledText className='text-white text-center'>ADD</StyledText>
            </StyledButton>
          </StyledView>

          <StyledView className='absolute bottom-0 h-2/5 w-full inset-x-0'>
            <LinearGradient 
            colors={['#000000', 'transparent']} 
            start={{ x: 0.5, y: 1 }} // Gradient start point
            end={{ x: 0.5, y: 0}}   // Gradient end point/>
            style={{ flex: 1 }}
            >
              <StyledView className='absolute bottom-20 w-full'>
                <StyledPressable onPress={() => {setModalVisible(true)}} className='w-full'>
                  <StyledImage source={icons.carrot} className='w-5 h-5 self-center'/>
                  <StyledText className='text-white text-2xl pl-4 pr-4 font-bold truncate' numberOfLines={1}>{item.title}</StyledText>
                  <StyledText className='pl-4 pr-4 text-white truncate' numberOfLines={1}>{item.description}</StyledText>
                </StyledPressable>
                <StyledView className='flex-1 flex-row mb-2 justify-center ml-4 mr-4'>
                  <StyledPressable 
                    className='flex-1 flex-row basis-2/3 mt-2 bg-primary rounded-2xl border-2 border-white overflow-hidden justify-center items-center' 
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
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
                    <StyledText className='text-white text-2xl text-center font-bold'>${item.price}</StyledText>
                    <StyledText className='pl-8 text-white text-2xl text-center'>Buy Now</StyledText>
                  </StyledPressable>
                  <StyledPressable className='flex-1 mt-2 bg-black rounded-2xl border-2 border-white justify-center basis-1/3' onPress={handleOffer}>
                    <StyledText className='text-white text-2xl text-center'>Offer</StyledText>
                  </StyledPressable>
                </StyledView>
                <StyledView className='flex flex-row justify-center gap-x-8 mb-2'>
                  {item.urls.map((_, index) => (
                    <StyledView key={index} className={`${index===currentImageIndex ? 'bg-primary': 'bg-white'} w-3 h-3 rounded-full`} />
                  ))}
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledView>
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              setModalVisible(!modalVisible);
            }}>
            <StyledView className='flex-1 flex-row justify-center mt-16'>
              <StyledView className='flex-1 bg-white rounded-xl h-full'>
                <StyledImage source={icons.carrot} className='absolute w-5 h-5 left-1/2 mt-2'></StyledImage>
                <StyledImage source={{uri:item.urls[0]}} className='h-96'/>
                <StyledText className='text-3xl font-bold pl-4 mt-2'>{item.title}</StyledText>
                <StyledText className='pl-4 mt-2'>{item.description}</StyledText>
                <StyledPressable
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text>Hide Modal</Text>
                </StyledPressable>
              </StyledView>
            </StyledView>
          </Modal>
        </StyledImageBackground>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={listings}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      pagingEnabled
      snapToInterval={screenHeight} // Ensure snapping to full screen height
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      initialNumToRender={5}
    />
  );
};

export default Index;