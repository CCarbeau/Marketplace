import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, Pressable, ImageBackground, FlatList, Dimensions, Alert, Animated, Platform, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import icons from '../../../../constants/icons';
import Modal from 'react-native-modal';
import ListingPage from '@/app/listing/[id]';
import RenderBottomBar from '@/app/listing/BottomBar';
import { Listing, AuthContextProps } from '@/types/interfaces';
import { handleComment, handleFollow, handleLike, handleProfile } from '@/app/functions/userInput';
import { AuthContext } from '@/src/auth/AuthContext';
import { fetchRandomListings, fetchSeller } from '@/app/functions/fetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledImageBackground = styled(ImageBackground)

const Index = () => {
  const { height: screenHeight } = Dimensions.get('window');
  
  const isIOS = Platform.OS === 'ios';
  const tabBarHeight = isIOS ? 72 : 56;
  const imageBackgroundHeight = screenHeight - tabBarHeight;  
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [modalVisible, setModalVisible] = useState<{ [key: string]: boolean }>({});
  const { user, profile, updateProfile } = useContext(AuthContext) as AuthContextProps; 


  useEffect(() => {
    fetchRandomListing(); // Initial fetch
  }, []);
  
  const fetchRandomListing = async () => {
    try {
      // Set loading state if listings array is empty initially
      if (listings.length === 0) {
        setLoading(true);
      }
  
      const ret = await fetchRandomListings(undefined, undefined, undefined, 10, undefined);
      
      if(ret){
        // Fetch sellers for each listing concurrently
        const listingsWithSellers = await Promise.all(
          ret.map(async (listing: Listing) => {
            if (listing.ownerUID){
              const seller = await fetchSeller(listing.ownerUID);
              return { ...listing, seller }; 
            }
          })
        );
      
  
        // Set new listings by filtering out duplicates
        setListings((prevListings) => {
          const existingIds = new Set(prevListings.map((listing) => listing.id));
          const newUniqueListings = listingsWithSellers.filter(
            (listing) => !existingIds.has(listing.id)
          );
          return [...prevListings, ...newUniqueListings];
        });
      }
  
    } catch (error: unknown) {
      console.error(error);
  
      if (error instanceof Error) {
        if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
          setNetworkError(true);
        } else {
          console.error("Non-network error occurred:", error.message);
        }
      } else {
        console.error("An unexpected error occurred:", error);
      }
  
    } finally {
      setLoading(false); 
    }
  };  

  const handleLoadMore = () => {
    fetchRandomListing();
  };

  const handleImagePress = () => {
    setCurrentImageIndex((prevIndex) => {
      const currentListing = listings[0];
      const newIndex = prevIndex + 1;
      return newIndex < currentListing.images.length ? newIndex : 0;
    });
  };

  const handleModalOpen = (id: string) => {
    setModalVisible((prevState) => ({ ...prevState, [id]: true }));
  };

  const handleModalClose = (id: string) => {
    setModalVisible((prevState) => ({ ...prevState, [id]: false }));
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const imageUrl = item.images[currentImageIndex];
    const likes = item.likes;

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
              <StyledPressable className='absolute right-4 bottom-8 shadow-sm shadow-darkGray' onPress={() => router.push('/(tabs)/home/(tabs)/messages')}>
                <StyledImage 
                  source={icons.message} 
                  className='h-8 w-8'
                />
              </StyledPressable>
            </LinearGradient>
          </StyledView>

          <StyledView className='absolute mt-80 right-4 z-10 shadow-sm shadow-darkGray'>
            <Pressable onPress={() => {handleLike(item.id, !isLiked, profile, router), setIsLiked(!isLiked)}}>
              <StyledImage source={isLiked ? icons.heartFull : icons.heartEmpty} className='w-12 h-12' />
              <StyledText className='p-2 text-white text-center'>{likes}</StyledText>
            </Pressable>

            <Pressable onPress={handleComment}>
              <StyledImage source={icons.message} className="w-12 h-12" />
            </Pressable>

            <Pressable onPress={() => {handleProfile(item.ownerUID, router, profile)}}>
              <StyledImage source={{uri: item.seller.pfp}} className='mt-6 h-12 w-12 rounded-full border'/>
            </Pressable>

            
            {user?.uid !== item.ownerUID && !profile?.following.includes(item.ownerUID ?? '') && (
              <StyledPressable style={{ marginTop: 4, borderColor: 'white', borderWidth: 2, borderRadius: 16 }} onPress={() => {handleFollow(item.ownerUID, false, profile, updateProfile)}}>
                <StyledText className='text-white text-center'>ADD</StyledText>
              </StyledPressable>
            )}
          </StyledView>

          <StyledView className='absolute bottom-0 h-2/5 w-full inset-x-0'>
            <LinearGradient 
            colors={['#000000', 'transparent']} 
            start={{ x: 0.5, y: 1 }} // Gradient start point
            end={{ x: 0.5, y: 0}}   // Gradient end point/>
            style={{ flex: 1 }}
            >
              <StyledView className='absolute bottom-20 w-full shadow-sm shadow-darkGray'>
                <StyledPressable onPress={() => {handleModalOpen(item.id)}} className='w-full rounded-2xl active:bg-lightGray active:opacity-50'>
                  <StyledImage source={icons.carrot} className='w-5 h-5 self-center'/>
                  <StyledText className='text-white text-2xl pl-4 pr-4 font-bold truncate mt-2' numberOfLines={1}>{item.title}</StyledText>
                  <StyledText className='pl-4 pr-4 text-white truncate' numberOfLines={1}>{item.description}</StyledText>
                </StyledPressable>
                <StyledView className='flex-row mb-2 ml-2'>
                  <RenderBottomBar 
                    listing = {item}
                  />
                </StyledView>
                <StyledView className='flex flex-row justify-center gap-x-8 mb-2'>
                  {item.images.map((_, index) => (
                    <StyledView key={index} className={`${index===currentImageIndex ? 'bg-primary': 'bg-white'} w-3 h-3 rounded-full`} />
                  ))}
                </StyledView>
              </StyledView>
            </LinearGradient>
          </StyledView>
          
          <Modal
            isVisible={modalVisible[item.id]}
            style={styles.bottomModal}
            onBackdropPress={() => {handleModalClose(item.id)}}
            swipeDirection="down" // Allows swipe-to-dismiss
            onSwipeComplete={() => {handleModalClose(item.id)}}
          >
            <StyledView className='flex absolute top-0 items-center w-full h-8 z-10'>
                <StyledPressable onPress={() => {handleModalClose(item.id)}} className='flex w-full h-10 active:bg-lightGray active:opacity-50 items-center' style={{borderTopLeftRadius:16, borderTopRightRadius: 16}}>
                    <StyledImage source={icons.carrot} className='w-5 h-5 mt-2' style={{ transform: [{ rotate: '180deg' }] }}></StyledImage>
                </StyledPressable>
            </StyledView>
            <ListingPage id={item.id}/>
          </Modal>
        </StyledImageBackground>
      </Pressable>
    );
  };

  if (loading) {
    return (
    <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF5757" />
    </StyledView>
    );
  }

  const handleRetry = () => {
    setNetworkError(false);
    fetchRandomListing(); // Retry fetching data
  };

  if(networkError){
    return (
      <StyledView className="flex-1 justify-center items-center">
        <StyledText className="text-xl font-bold">Failed to load listings</StyledText>
        <StyledText className="text-lg">Check your internet connection</StyledText>
        <StyledPressable className="mt-4 p-4 bg-primary active:bg-primaryDark rounded-xl" onPress={handleRetry}>
          <StyledText className="text-white font-bold">Retry</StyledText>
        </StyledPressable>
      </StyledView>
    )
  }

  return (
    <FlatList
      data={listings}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.2}
      pagingEnabled
      snapToInterval={screenHeight} // Ensure snapping to full screen height
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      initialNumToRender={5}
    />
  );
};

const styles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0, // Ensures modal takes full width of the screen
    marginTop: 108,
  },
});

export default Index;