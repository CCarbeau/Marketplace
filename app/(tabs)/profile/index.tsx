import { View, Text, Pressable, Image, Alert, ScrollView, ImageBackground, Animated, useWindowDimensions, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Listing, Seller, Review, AuthContextProps } from '@/types/interfaces';
import { AuthContext } from '@/src/auth/AuthContext';


import profileExample from '../../../assets/images/profileExample.png';
import icons from '@/constants/icons'
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleFollow, handleProfile } from '@/app/functions/userInput';
import { fetchReviews, fetchSeller } from '@/app/functions/fetch';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledView = styled(View);
const StyledImage = styled(Image);
const StyledImageBackground = styled(ImageBackground);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ProfilePageProps {
  id?: string;
}

const ProfilePage:React.FC<ProfilePageProps> = () => {
  const router = useRouter();
  const { user, profile } = useContext(AuthContext) as AuthContextProps;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [otherProf, setOtherProf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const layout = useWindowDimensions();

  useEffect(() => {
    const fetchSellerData = async () => {
      if (params.id) {
        const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
        if (paramId !== '[id].tsx') {
          setSellerId(paramId);
          setOtherProf(true);
          setLoading(true);
          try {
            const fetchedSeller = await fetchSeller(paramId);
            setSeller(fetchedSeller);
          } catch (error) {
            console.error('Error fetching seller:', error);
          } finally {
            setLoading(false);
          }
        }
      } else if (user && profile) {
        
        setSellerId(user.uid);
        setSeller(profile as Seller); 
      }
    };

    fetchSellerData();
  }, [refreshing]);

  const [fontSize, setFontSize] = useState(32); // Default font size (4xl equivalent)

  const username = seller?.username.toLocaleUpperCase(); // Replace this with your dynamic value
  
  // Adjust font size based on username
  useEffect(() => {
    if(username){
      if (username.length > 20) {
        setFontSize(22); // Smaller font size for longer text
      }else if (username.length > 17) {
        setFontSize(24); // Smaller font size for longer text
      }else if (username.length > 15) {
        setFontSize(28); // Smaller font size for longer text
      }else if (username.length > 13) {
        setFontSize(32); // Smaller font size for longer text
      } else if (username.length > 12) {
        setFontSize(36); // Smaller font size for longer text
      } else {
        setFontSize(40); // Larger font size for shorter text
      }
    }
  }, [username]);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState(0); // For custom tab control

  const handleTabPress = (index: number) => {
    if (index !== activeTab) {
      setActiveTab(index);
  
      Animated.spring(animatedValue, {
        toValue: index * layout.width, // Update to scroll to the selected tab
        useNativeDriver: true,
      }).start();
  
      if (scrollViewRef.current) {
        // Scroll the ScrollView to the selected tab position
        scrollViewRef.current.scrollTo({ x: index * layout.width, animated: true });
      }
    }
  };
  
  const onScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    animatedValue.setValue(scrollX / layout.width); // Update based on layout width
  
    // Calculate the active tab index based on scroll position
    const index = Math.round(scrollX / layout.width);
    if (index !== activeTab) {
      setActiveTab(index);
    }
  };
  
  // Update indicator translation calculation for three tabs
  const indicatorTranslateX = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, layout.width / 3, (layout.width / 3) * 2], // Dividing by 3 for three tabs
  });

  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchActiveListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/listings/fetch-owner-listings-by-recent?sellerId=${sellerId}&numListings=9`, {
          method: 'GET',
        });
  
        if (!response.ok) {
          throw new Error(`Error fetching listings: ${response.status}`);
        }
  
        const data = await response.json();
        
        setActiveListings(data.listings);
      } catch (error) {
        console.log('Cannot fetch listings', error);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    }

    fetchActiveListings();

    const fetchSoldListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/listings/fetch-owner-listings-by-recent?sellerId=${sellerId}&numListings=9&sold=true`, {
          method: 'GET',
        });
  
        if (!response.ok) {
          throw new Error(`Error fetching listings: ${response.status}`);
        }
  
        const data = await response.json();
      
        setSoldListings(data.listings);
      } catch (error) {
        console.log('Cannot fetch listings', error);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    }

    fetchSoldListings();

    const fetchReviewsData = async () => {
      if(sellerId){
        try{
          setLoading(true);

          const ret = await fetchReviews(sellerId);

          if (ret) {
            setReviews(ret); // Only set seller if data is returned
          } else {
            console.log("Seller data is null or undefined");
          }

        }catch (error){
          console.log('Error fetching reviews', error);
        }finally{
          setRefreshing(false);
          setLoading(false);
        }
      }
    }

    fetchReviewsData();
    
  }, [sellerId, refreshing])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const itemWidth = layout.width / 3;
  const itemHeight = layout.height / 4; 

  const renderListingTabItem = ({ item }: { item: Listing }) => {

    return (
      <StyledPressable onPress={() => {router.push(`/listing/${item.id}`)}}>
        <StyledView className="border border-0.5" style={{ width: itemWidth, height: itemHeight }}>
          <StyledImage source={{ uri: item.images[0] }} className="w-full h-full" />
        </StyledView>
      </StyledPressable>
    );
  };

  const renderReviews = ({ item }: { item: Review})=>{
    return (
      <StyledView className='w-full items-center'>
        <StyledView className='border-2 border-darkGray rounded-2xl p-1 ml-2 mt-2' style={{width: layout.width*5/6 }}>
          <StyledPressable className='active:bg-gray rounded-xl' onPress={() => { handleProfile(item.reviewerId, router) }}>
            <StyledView className='flex-row items-center justify-between p-1'>
              <StyledView className='flex-row items-center'>
                {item.reviewerPfp ? (
                  <StyledImage source={{ uri: item.reviewerPfp }} className="w-10 h-10 rounded-full" />
                ) : (
                  <StyledImage source={icons.profile} className="w-10 h-10" />
                )}
                <StyledView className='ml-1'>
                  <StyledText className='font-bold'>{item.reviewerUsername}</StyledText>
                  <StyledText className='text-xs mb-1'>{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</StyledText>
                </StyledView>
              </StyledView>
              <StyledView className='flex-row items-center'>
                <StyledText className='text-lg'>{item.rating}</StyledText>
                <StyledImage source={icons.star} style={{ tintColor: '#FF5757' }} className='ml-1 w-5 h-5' />
              </StyledView>
            </StyledView>
          </StyledPressable>
          <StyledView className='w-full mr-1 ml-1'>
            <StyledText numberOfLines={4}>{item.description}</StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    )
  }

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF5757" />
      </StyledView>
    );
  }
  
  if (!user) {
    return (
      <StyledView className='flex-1 w-full h-full'>
        <StyledView className='flex mt-16 h-96'>
          <StyledImage source={profileExample} className='h-full w-full' />
        </StyledView>
        <StyledView className='w-full h-48 mt-4'>
          <StyledText className='text-4xl font-bold pl-4 pr-4 mt-2'>
            Social Media Feel
          </StyledText>
          <StyledText className='pl-4 pr-4'>
            Customize your profile, post your listings, and build an audience. Sell your cards faster using Hobby.
          </StyledText>
        </StyledView>
        <StyledView className='flex absolute w-full h-32 bottom-12'>
          <StyledPressable
            onPress={() => { router.push('/(auth)/'); }}
            className='flex justify-center bg-primary flex-1 mr-4 ml-4 rounded-full'
          >
            <StyledText className='text-white text-center font-bold text-3xl p-2'>
              Sign In
            </StyledText>
          </StyledPressable>

          <StyledPressable
            onPress={() => { router.push('/(auth)/signUp'); }}
            className='flex justify-center flex-1 ml-4 mr-4 mt-4 rounded-full border-2 border-black'
          >
            <StyledText className='text-black text-center font-bold text-3xl p-2'>
              Sign Up
            </StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={refreshing?{paddingTop:48}:{}}
      nestedScrollEnabled={true} 
      showsVerticalScrollIndicator={false}
      refreshControl={
          <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              progressViewOffset={48}
              tintColor="#FF5757"
          />
      }
    >
      <StyledView className='w-full h-full bg-white'>
        <StyledView className='h-48'>
          <StyledImageBackground source={{uri: seller?.banner}} className='w-full bg-primary h-full justify-end'>
            {!otherProf && (
              <SafeAreaView>
                <StyledPressable className='absolute top-2 left-4' onPress={() => {router.push('/(tabs)/profile/notifications')}}>
                  <StyledImage source={icons.bell} className='w-7 h-7'/>
                </StyledPressable>
                <StyledPressable className='absolute top-2 right-4' onPress={() => {router.push('/(tabs)/profile/menu')}}>
                  <StyledImage source={icons.menu} className='w-6 h-6'/>
                </StyledPressable>
              </SafeAreaView>
            )}
              <StyledView className='flex-row justify-between items-center ml-2 mr-4 h-12'>
                <StyledText className='text-white font-bold flex-1 shadow-sm shadow-darkGray ml-2' style={{ fontSize: fontSize }}>
                  {username}
                </StyledText>
                <StyledView className='flex-row rounded-3xl bg-darkGray pl-2 pr-2 pt-1 pb-1 items-center justify-center'>
                  <StyledText className='text-xl font-bold text-white'>{seller?.rating}</StyledText>
                  <StyledImage source={icons.star} style={{ tintColor: '#FF5757' }} className='ml-2 w-6 h-6' />
                </StyledView>
              </StyledView>
          </StyledImageBackground>
        </StyledView>
        <StyledView className='mr-2 ml-2 mb-4 rounded-xl pt-2 pl-2'>
          <StyledView className='flex-row w-full h-24 rounded-xl'>
            <StyledImage source={{uri: seller?.pfp }} className='border rounded-full w-24 h-24' /> 
            <StyledView className='flex-1 mt-2'>
              <StyledView className='flex-row justify-evenly'>
                <StyledView className='items-center justify-center w-18'>
                  <StyledText className='text-lg font-bold '>{seller?.itemsSold}</StyledText>
                  <StyledText className='-mt-1'>Items sold</StyledText>
                </StyledView>
                <StyledView className='items-center justify-center w-18'>
                  <StyledText className='text-lg font-bold'>{seller?.numberOfFollowers}</StyledText>
                  <StyledText className='-mt-1'>Followers</StyledText>
                </StyledView>
                <StyledView className='items-center justify-center w-18'>
                  <StyledText className='font-bold text-lg'>{seller?.numberOfFollowing}</StyledText>
                  <StyledText className='-mt-1'>Following</StyledText>
                </StyledView>
              </StyledView>
              <StyledView className='flex-row flex-1 justify-evenly mt-3 mr-2 ml-2'>
                {!otherProf?(
                  <>
                    <StyledPressable onPress={() => {router.push('/(tabs)/profile/edit')}}className='flex-1 justify-center items-center border rounded-xl p-2 mr-2 active:bg-gray'>
                      <StyledText className='font-bold'>Edit Profile</StyledText>
                    </StyledPressable>
                    <StyledPressable className='flex-1 justify-center items-center bg-primary active:bg-primaryDark rounded-xl p-2'>
                      <StyledText className='font-bold text-white'>Share Profile</StyledText>
                    </StyledPressable>
                  </>
                ):(
                  <>
                    <StyledPressable onPress={() => {handleFollow}}className='flex-1 justify-center items-center bg-primary active:bg-primaryDark rounded-xl p-2 mr-2'>
                      <StyledText className='font-bold text-white'>Follow</StyledText>
                    </StyledPressable>
                    <StyledPressable className='flex-1 justify-center items-center rounded-xl p-2 border active:bg-gray'>
                      <StyledText className='font-bold'>Message</StyledText>
                    </StyledPressable>
                  </>
                )}
              </StyledView>
            </StyledView>
          </StyledView>
          <StyledView className='pt-2 pb-2 mt-1'>
            <StyledText className='font-bold'>{seller?.name}</StyledText>
            <StyledText className='' numberOfLines={4}>{seller?.description}</StyledText>
          </StyledView>
        </StyledView>
        <StyledView className="flex-1 w-full bg-transparent rounded-2xl">
          <ScrollView 
              contentContainerStyle={refreshing?{paddingTop:48}:{}}
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={false}
          >
            <StyledView className="rounded-2xl">
              {/* Listing Image and Buttons */}
          
      
              {/* Custom Tab Header */}
              <StyledView className="">
                <StyledView className="flex-row justify-around">
                    <StyledPressable onPress={() => handleTabPress(0)} className="p-2 mt-2">
                      <StyledImage source={icons.sell} className='w-6 h-6' style={{tintColor: activeTab===0 ? '#FF5757' : '#8C8C8C'}}/>
                    </StyledPressable>
                    <StyledPressable onPress={() => handleTabPress(1)} className='p-2 mt-2'>
                      <StyledImage source={icons.gavel} className='w-6 h-6' style={{tintColor: activeTab===1 ? '#FF5757' : '#8C8C8C'}}/>
                    </StyledPressable>
                    <StyledPressable onPress={() => handleTabPress(2)} className='p-2 mt-2'>
                      <StyledImage source={icons.message} className='w-6 h-6' style={{tintColor: activeTab===2 ? '#FF5757' : '#8C8C8C'}}/>
                    </StyledPressable>
        
                    {/* Indicator */}
                    <Animated.View
                      style={{
                          position: 'absolute',
                          bottom: 0,
                          height: 4,
                          left: (layout.width ) / 6 - (layout.width) / 10,
                          width: (layout.width ) / 5,
                          backgroundColor: '#FF5757',
                          borderRadius: 24,
                          transform: [{ translateX: indicatorTranslateX }],
                      }}
                    />
                </StyledView>
    
                {/* Tab Content */}
                <Animated.View>
                  <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    nestedScrollEnabled
                    style={{marginTop: 4}}
                    >
                        <StyledView style={{ width: layout.width }}>
                            {/* Active */}
                            {activeListings.length === 0 ? (
                              <StyledView className='items-center justify-center mt-8'>
                                <StyledText className='font-bold text-2xl'>No Active Listings</StyledText>
                              </StyledView>
                            ):(
                              <FlatList
                                data={activeListings}
                                renderItem={renderListingTabItem}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={3} 
                                showsVerticalScrollIndicator={false}
                                scrollEnabled = {false}
                              />
                            )}
                        </StyledView>

                        <StyledView style={{ width: layout.width}}>
                            {/* Sold */}
                            {soldListings.length === 0 ? ( 
                              <StyledView className='items-center justify-center mt-8'>
                                <StyledText className='font-bold text-2xl'>No Sold Listings</StyledText>
                                <StyledText className=''>Be their first buyer!</StyledText>
                              </StyledView>
                            ):(
                              <FlatList
                              data={soldListings}
                              renderItem={renderListingTabItem}
                              keyExtractor={(item) => item.id.toString()}
                              numColumns={3} 
                              showsVerticalScrollIndicator={false}
                              scrollEnabled = {false}
                            />
                            )}
                        </StyledView>

                        <StyledView style={{ width: layout.width}}>
                            {/* Reviews */}
                            {reviews.length === 0 ?(
                              <StyledView className='items-center justify-center mt-8'>
                                <StyledText className='font-bold text-2xl'>No Reviews</StyledText>
                              </StyledView>
                            ):(
                              <FlatList
                                data={reviews}
                                renderItem={renderReviews}
                                keyExtractor={(item) => item.createdAt}
                                showsVerticalScrollIndicator={false}
                                scrollEnabled = {false}
                              />   
                            )} 
                        </StyledView>
                    </ScrollView>
                </Animated.View>
              </StyledView>
              <StyledView className='h-32'/>
            </StyledView>
          </ScrollView>
        </StyledView>
      </StyledView>
    </ScrollView>
  );
};

export default ProfilePage;