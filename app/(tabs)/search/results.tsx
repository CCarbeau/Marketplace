import { fontScale, styled } from 'nativewind';
import {liteClient as algoliasearch, MultipleQueriesResponse} from 'algoliasearch/lite';
import { useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, TextInput, ScrollView, Pressable, Text, Image, Keyboard, ImageBackground, Dimensions} from 'react-native';
import { AuthContextProps, Listing, RawTimestamp, RecentSearch, Seller } from '@/types/interfaces';
import icons from '@/constants/icons';
import Animated, { SlideInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AuthContext } from '@/src/auth/AuthContext';
import { handleProfile } from '@/src/functions/userInput';
import { useRouter } from 'expo-router';
import { fetchSeller } from '@/src/functions/fetch';
import Modal from 'react-native-modal';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledView = styled(View);
const StyledImageBackground = styled(ImageBackground);

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const ALGOLIA_APP_ID = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ResultsPage = () => {
  const { query } : {query: string} = useLocalSearchParams();
  const { profile, updateProfile } = useContext(AuthContext) as AuthContextProps;

  const textInputRef = useRef<TextInput>(null);
  const router = useRouter();

  const ALGOLIA_APP_ID = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID;
  const ALGOLIA_SEARCH_API_KEY = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY;

  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [augmentedResults, setAugmentedResults] = useState<(Listing & { seller?: Seller })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [listingSuggestions, setListingSuggestions] = useState<string[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<Seller[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY) {
    console.error('Algolia environment variables are missing.');
    return null;
  }

  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

  useEffect(() => {

    fetchResults();
  }, [query]);

  const [sorting, setSorting] = useState<{ price: 'asc' | 'desc' | null, likes: 'asc' | 'desc' | null, bids: 'asc' | 'desc' | null, time: 'asc' | 'desc' | null}>({ price: null, likes: null, bids: null, time: null });

  const fetchResults = async () => {
    try {
      let indexName = 'listings_index'; // Default index

      // Use appropriate replica index for sorting
      if (sorting.price === 'asc') {
        indexName = 'listings_index_price_asc'; // Replace with your replica index
      } else if (sorting.price === 'desc') {
        indexName = 'listings_index_price_desc'; // Replace with your replica index
      }

      const { results }: MultipleQueriesResponse = await client.search({
        requests: [
          {
            indexName,
            query,
          },
        ],
      });

      const hits = results[0]?.hits || [];
      const mappedResults: Listing[] = hits.map((hit: any) => ({
        id: hit.objectID,
        title: hit.title,
        description: hit.description,
        images: hit.images || [],
        price: hit.price || 0,
        ownerUID: hit.ownerUID,
      }));

      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Error fetching Algolia results:', error);
    }
  };


  useEffect(() => {
    const augmentResults = async () => {
      const augmented = await Promise.all(
        searchResults.map(async (result) => {
          // Fetch additional listing data
          const listing = await fetch(`${API_URL}/listings/fetch-listing-by-id?id=${result.id}`, {
            method:'GET',
          });
          const listingData = await listing.json()
  
          // Fetch seller data
          let seller;
          if (result.ownerUID) {
            seller = await fetchSeller(result.ownerUID);
          }
  
          // Combine original result with fetched data
          return { ...result, ...listingData.listing, seller };
        })
      );

      setAugmentedResults(augmented);
    };
  
    if (searchResults.length > 0) {
      augmentResults();
    }
  }, [searchResults]);

  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes: { [key: string]: string } = {};

      augmentedResults?.forEach((listing) => {
        if(listing.endDate){
          const endTime = convertRawTimestampToMillis(listing.endDate); 

          if (isNaN(endTime)) {
            console.error(`Invalid endDate for listing ID ${listing.id}`);
            updatedTimes[listing.id] = "Invalid end time";
            return;
          }

          const now = Date.now();
          const timeLeft = endTime - now;

          if (timeLeft > 0) {
            updatedTimes[listing.id] = formatTime(timeLeft);
          } else {
            updatedTimes[listing.id] = "Expired";
          }
        }
      });
      
      setRemainingTimes(updatedTimes);
    }, 1000);
    
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [augmentedResults]);
  
  const convertRawTimestampToMillis = (timestamp: RawTimestamp): number => {
    const seconds = Number(timestamp._seconds);
    const nanoseconds = Number(timestamp._nanoseconds);
    if (isNaN(seconds) || isNaN(nanoseconds)) {
      console.error("Invalid RawTimestamp format:", timestamp);
      return NaN;
    }
    return seconds * 1000 + nanoseconds / 1_000_000; // Convert to milliseconds
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} Days`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };



  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push({
        pathname: "/(tabs)/search/results",
        params: { query: searchQuery },
      });
    }
  };

  const handleChangeText = (query: string) => {
    setSearchQuery(query);
    fetchListingSuggestions(query);
    fetchUserSuggestions(query);
  }

  const fetchListingSuggestions = async (query: string) => {
    try {
      const { results } : {results: MultipleQueriesResponse} = await client.search({
        requests: [
          {
            indexName: 'listings_index',
            query,
            hitsPerPage: 5,
          },
        ],
      });
      const newSuggestions = results[0].hits.map((hit: any) => hit.title);
      setListingSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchUserSuggestions = async (query: string) => {
    try {
      const { results } : {results: MultipleQueriesResponse} = await client.search({
        requests: [
          {
            indexName: 'userData_index',
            query,
            hitsPerPage: 5,
          },
        ],
      });
      const newSuggestions = results[0].hits
      setUserSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const inputWidth = useSharedValue(0.75); // Start with 75% width

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${inputWidth.value * 100}%`,
  }));

  const handleFocus = () => {
    inputWidth.value = withTiming(0.85, { duration: 300 }); // Expand to 90%
    setShowOverlay(true);
  };

  const handleBlur = () => {
    inputWidth.value = withTiming(0.75, { duration: 300 }); // Shrink back to 75%
    if (!searchQuery) {
      setShowOverlay(false);
    }
  };

  const handleSuggestionPress = (query: string) => {
    setShowOverlay(false);
  
    const newSearch: RecentSearch = { type: 'searchTerm', term: query };
  
    const updatedRecentSearches = addToRecentSearches(newSearch, profile?.recentSearches || []);
  
    updateProfile({
      recentSearches: updatedRecentSearches,
    });
  
    router.push({
      pathname: "/(tabs)/search/results",
      params: { query: query },
    });
  };
  

  const handleUserSuggestionPress = (seller : any) => {
    setShowOverlay(false);
  
    const newSellerSearch: RecentSearch = {
      type: 'seller',
      seller: seller, 
    };
  
    const updatedRecentSearches = addToRecentSearches(newSellerSearch, profile?.recentSearches || []);
  
    updateProfile({
      recentSearches: updatedRecentSearches,
    });
    
    handleProfile(seller.objectID, router, profile);
  };  

  const handleEnter = () => {
    setShowOverlay(false);
    textInputRef.current?.blur(); 
    Keyboard.dismiss(); 
    handleBlur(); 
    
    const newSearch: RecentSearch = { type: 'searchTerm', term: searchQuery };
  
    const updatedRecentSearches = addToRecentSearches(newSearch, profile?.recentSearches || []);
  
    updateProfile({
      recentSearches: updatedRecentSearches,
    });

  
    router.push({
      pathname: "/(tabs)/search/results",
      params: { query: searchQuery },
    });
    
    setSearchQuery('');
  }

  const addToRecentSearches = (
    newItem: RecentSearch,
    recentSearches: RecentSearch[]
  ): RecentSearch[] => {
    const filtered = recentSearches.filter((item) => {
      if (item.type === 'seller' && newItem.type === 'seller') {
        return item.seller.id !== newItem.seller.id; 
      } else if (item.type === 'searchTerm' && newItem.type === 'searchTerm') {
        return item.term !== newItem.term; 
      }
      return true; 
    });
  
    return [newItem, ...filtered].slice(0, 10);
  };

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isSecondPage, setIsSecondPage] = useState(false); // Tracks current modal page
  const modalAnimatedValue = useSharedValue(0); // Animation for sliding pages

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(modalAnimatedValue.value, { duration: 300 }), // Smooth slide effect
      },
    ],
  }));

  const navigateToSecondPage = () => {
    setIsSecondPage(true);
    modalAnimatedValue.value = -screenWidth; // Slide to the second page
  };
  
  const navigateToFirstPage = () => {
    setIsSecondPage(false);
    modalAnimatedValue.value = 0; // Slide back to the first page
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  }

  const rotation = useSharedValue(0); 

  const resetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  const handleReset = () => {
    rotation.value = withTiming(rotation.value - 360, { duration: 500 }); // Rotate counter-clockwise 360 degrees
    clearSort('', null);
    fetchResults();
  };

  const clearSort = (field: string, value: "desc" | "asc" | null) => {
    setSorting({
      price: field === 'price' ? value : null,
      likes: field === 'likes' ? value : null,
      bids: field === 'bids' ? value : null,
      time: field === 'time' ? value : null,
    });
  };  
  
  
  const applySorting = () => {
    fetchResults();
  };
  

  return (
    <StyledView className='flex-1'>
      <StyledView className='flex-1 p-1 mt-4'>
        {/* Search Bar */}
        <StyledView className="absolute right-0 left-0 top-16 flex-row items-center mb-4 justify-center z-20">
          <StyledPressable 
              className='absolute left-2' 
              onPress={() => {
                textInputRef.current?.blur(); 
                Keyboard.dismiss(); 
                handleBlur(); 
                setShowOverlay(false);
                setSearchQuery('');

                if(!showOverlay){
                  router.back();
                }

              }}>
              <StyledImage
                  source={icons.carrotBlack}
                  className="w-5 h-5"
                  style={{ tintColor: '#FF5757', transform: [{ rotate: '90deg' }] }}
              />
          </StyledPressable>
          <Animated.View style={[animatedStyle]} className="w-full flex-row items-center bg-white border border-darkGray rounded-full px-4 py-2">
            <StyledImage
              source={icons.search}
              className="w-5 h-5 mr-2"
            />
            <StyledTextInput
              value={searchQuery}
              onChangeText={(text) => {handleChangeText(text)}}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search..."
              className="flex-1 text-sm"
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  handleEnter()
                }
              }}
            />
        </Animated.View>
      </StyledView>

      {/* Filter Button */}

      <StyledPressable 
        className={`absolute bottom-4 right-4 p-4 flex-row bg-primary active:bg-primaryDark rounded-3xl z-${showOverlay ? '5' : '20'} items-center justify-center`}
        onPress={() => {toggleFilterModal();}}
      >
      <StyledImage source={icons.filter} className='w-6 h-6'/>
      </StyledPressable>

    {/* Search Results (Dynamic Suggestions) */}

    <ScrollView
      showsVerticalScrollIndicator = {false}
      style={{paddingTop: 108}}
    >
      <StyledView className=''>
        {augmentedResults.map((item: Listing & { seller?: Seller }) => (
          <StyledView key={item.id} className="h-40 w-full">
            <StyledView className='w-full h-px bg-lightGray' />
            <StyledPressable 
              className='flex-row h-full w-full items-center pl-4 pr-4 active:bg-lightGray' 
              onPress={() => {router.push(`/listing/${item.id}`)}}
            >
              <StyledImage source={{uri: item.images[0]}} className='w-24 h-32 rounded-xl border border-0.5'/>
              <StyledView className='ml-2 flex-1 h-full pt-4'>
                <StyledText className='font-bold text-wrap h-10' numberOfLines={2} style={{fontSize:16}}>{item.title}</StyledText>
                {item.listingType === 'auction' ?(
                  <StyledText className="text-gray mt-1 -mb-1" numberOfLines={1}>
                      {item.bidCount} Bids | {remainingTimes[item.id] || "Calculating..."}
                  </StyledText>
                ):(
                  <StyledText className="text-gray mt-1 -mb-1" numberOfLines={1}>
                    {item.category}
                  </StyledText>
                )}
                <StyledView className='flex-row'>
                  <StyledText className='text-lg font-bold mt-1 mr-2'>${item.price}</StyledText>
                  <StyledPressable className='rounded-xl flex-row p-1 items-center'>
                    <StyledText className='text-lg mr-2 text-gray'>|</StyledText>
                    <StyledText className='text-lg text-black font-bold'>{item.likes}</StyledText>
                    <StyledImage source={icons.heartEmpty} className='w-5 h-5 ml-2' style={{tintColor:'#FF5757'}}/>
                  </StyledPressable>
                </StyledView>
                <StyledPressable
                      className="flex-row items-center active:bg-lightGray mt-1 rounded-xl"
                      onPress={() => handleProfile(item.seller.id, router, profile)}
                >
                  <StyledImage source={{ uri: item.seller.pfp }} className="h-8 w-8 rounded-full" />
                  <StyledView className='pl-2'>
                    <StyledText className="font-bold">{item.seller.username}</StyledText>
                    <StyledView className="flex-row items-center">
                      <StyledText className="text-gray" style={{ fontSize: 12 }}>
                        {item.seller.rating}
                      </StyledText>
                      <StyledImage
                        source={icons.starFull}
                        className="w-3 h-3 ml-1 mr-1"
                        style={{ tintColor: '#FF5757' }}
                      />
                      <StyledText className="text-gray" style={{ fontSize: 12 }}>
                        | {item.seller.numberOfFollowers} Followers
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledPressable>
              </StyledView>
            </StyledPressable>
          </StyledView>
        ))}
      </StyledView>
    </ScrollView>

    {showOverlay && (
      <StyledView className="absolute top-0 bottom-0 left-0 right-0 bg-white z-10 pt-4">
        <ScrollView contentContainerStyle={{ paddingTop: 16}}>
          {searchQuery.length === 0 ? (
            <>
              <StyledText className='text-lg font-bold mb-4 mt-20 pl-4'>Recent</StyledText>
              {(profile?.recentSearches || []).map((item, index) => (
                <StyledView key={index} className="w-full">
                  {item.type === 'searchTerm' ? (
                    // Render search term
                    <StyledPressable
                      className="flex-row items-center pl-4 pr-4"
                      onPress={() => handleSuggestionPress(item.term)}
                    >
                      <StyledImage source={icons.search} className="h-5 w-5" />
                      <StyledText className="p-4 font-bold">{item.term}</StyledText>
                    </StyledPressable>
                  ) : (
                    // Render seller profile
                    <StyledPressable
                      className="flex-row items-center pl-4 pr-4 active:bg-lightGray"
                      onPress={() => handleUserSuggestionPress(item.seller)}
                    >
                      <StyledImage source={{ uri: item.seller.pfp }} className="h-10 w-10 rounded-full" />
                      <StyledView className="p-4">
                        <StyledText className="font-bold">{item.seller.username}</StyledText>
                        <StyledView className="flex-row items-center">
                          <StyledText className="text-gray" style={{ fontSize: 12 }}>
                            {item.seller.rating}
                          </StyledText>
                          <StyledImage
                            source={icons.starFull}
                            className="w-3 h-3 ml-1 mr-1"
                            style={{ tintColor: '#FF5757' }}
                          />
                          <StyledText className="text-gray" style={{ fontSize: 12 }}>
                            | {item.seller.numberOfFollowers} Followers
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledPressable>
                  )}
                  <StyledView className="w-full h-px bg-lightGray" />
                </StyledView>
              ))}
            </>
          ):(
            <>
              <StyledView className='mt-20'></StyledView>
              {listingSuggestions.map((item,index)=> (
                <StyledView key={index} className='w-full'>
                  <StyledPressable 
                    className='flex-row items-center pl-4 pr-4' 
                    onPress={() => {handleSuggestionPress(item)}}
                  >
                    <StyledImage source={icons.search} className='h-5 w-5' />
                    <StyledText className='p-4 font-bold'>{item}</StyledText>
                  </StyledPressable>
                  <StyledView className='w-full h-px bg-lightGray' />
                </StyledView>
              ))}
              {userSuggestions.map((item,index)=> (
                <StyledView key={index} className='w-full'>
                  <StyledPressable 
                    className='flex-row items-center pl-4 pr-4 active:bg-lightGray' 
                    onPress={() => {handleUserSuggestionPress(item)}}
                  >
                    <StyledImage source={{uri: item.pfp}} className='h-10 w-10 rounded-full' />
                    <StyledView className='p-4'>
                      <StyledText className='font-bold'>{item.username}</StyledText>
                      <StyledView className='flex-row items-center'>
                        <StyledText className='text-gray' style={{fontSize: 12}}>{item.rating}</StyledText>
                        <StyledImage source={icons.starFull} className='w-3 h-3 ml-1 mr-1' style={{tintColor:'#FF5757'}}/>
                        <StyledText className='text-gray' style={{fontSize: 12}}>| {item.numberOfFollowers} Followers</StyledText>
                      </StyledView>
                    </StyledView>
                  </StyledPressable>
                  <StyledView className='w-full h-px bg-lightGray' />
                </StyledView>
              ))}
            </>
          )}
        </ScrollView>
      </StyledView>
    )}
    </StyledView>

    {/* Filter Modal */}
    <Modal
      isVisible={filterModalVisible}
      onBackdropPress={toggleFilterModal}
      swipeDirection="down"
      onSwipeComplete={toggleFilterModal}
      backdropOpacity={0.25}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
        marginTop: 108,
      }}
    >
      <StyledView className="bg-white h-96 w-full rounded-2xl pt-2">
        <Animated.View
          style={[
            animatedModalStyle,
            {
              flexDirection: 'row',
              width: screenWidth * 2, // Two pages
            },
          ]}
        >
          {/* First Page */}
          <StyledView className="w-1/2">
            <StyledView className="flex-row items-center justify-center w-full">
              <StyledPressable
                className="absolute left-4 active:bg-lightGray rounded-full h-8 w-8 items-center justify-center"
                onPress={toggleFilterModal}
              >
                <StyledImage source={icons.x} className="w-5 h-5" />
              </StyledPressable>
              <StyledText className="font-bold text-xl p-2">Filter</StyledText>
              <StyledPressable
                className="absolute right-4 rounded-full h-8 w-8 items-center justify-center"
                onPress={handleReset}
              >
                <Animated.View style={resetAnimatedStyle}>
                  <StyledImage
                    source={icons.reset}
                    style={{ tintColor: '#FF5757' }}
                    className="w-6 h-6"
                  />
                </Animated.View>
              </StyledPressable>
            </StyledView>
            <StyledView className="w-full h-px bg-lightGray" />

            {/* Sort Options */}
            <StyledView className='pl-4 pr-4'>
              <StyledPressable
                className="active:opacity-50 pt-2"
                onPress={navigateToSecondPage}
              >
                <StyledView className='flex-row justify-between items-center'>
                  <StyledText className='font-bold text-lg'>Sort</StyledText>
                  <StyledView className='flex-row items-center'>
                    <StyledText className="text-gray">
                      {sorting.price === 'desc' ? (
                        "Price Descending"
                      ) : sorting.price === 'asc' ? (
                        "Price Ascending"
                      ) : sorting.likes === 'desc' ? (
                        "Likes Descending"
                      ) : sorting.likes === 'asc' ? (
                        "Likes Ascending"
                      ) : sorting.bids === 'desc' ? (
                        "Bids Descending"
                      ) : sorting.bids === 'asc' ? (
                        "Bids Ascending"
                      ) : sorting.time === 'desc' ? (
                        "Ending Soonest"
                      ) : sorting.time === 'asc' ? (
                        "Newest"
                      ) : (
                        ""
                      )}
                    </StyledText>
                    <StyledImage className='ml-2 w-4 h-4' source={icons.carrotBlack} style={{opacity: 75, transform:[{rotate:'-90deg'}]}}/>
                  </StyledView>
                </StyledView>
                <StyledView className="w-full h-px bg-lightGray mt-2" />
              </StyledPressable> 

              {/* Apply Button */}
              <StyledPressable
                className="mt-6 bg-primary py-3 rounded-lg items-center justify-center"
                onPress={() => {
                  applySorting();
                  toggleFilterModal();
                }}
              >
                <StyledText className="text-white font-bold">Apply</StyledText>
              </StyledPressable>
            </StyledView>   
          </StyledView>

          {/* Second Page */}
          <StyledView className="w-1/2">
            <StyledView className="flex-row items-center justify-center w-full">
              <StyledPressable
                className="absolute left-2 active:bg-lightGray rounded-full h-8 w-8 items-center justify-center"
                onPress={navigateToFirstPage}
              >
                <StyledImage source={icons.carrotBlack} style={{tintColor:'#FF5757', transform:[{rotate:'90deg'}]}} className="w-5 h-5" />
              </StyledPressable>
              <StyledText className="font-bold text-xl p-2">Sort Options</StyledText>
            </StyledView>
            <StyledView className="w-full h-px bg-lightGray" />

            {/* Sorting Options */}
            <StyledView className="mt-4 pt-2 pl-4 pr-4 gap-y-4">
              {/* Sort by Price */}
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="font-bold text-darkGray w-28" style={{ fontSize: 16 }}>
                  Sort by Price:
                </StyledText>
                <StyledView className="flex-row space-x-2">
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.price === 'desc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('price', sorting.price === 'desc' ? null : 'desc'); // Toggle "High to Low"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.price === 'desc' && 'text-white'}`}>
                      High to Low
                    </StyledText>
                  </StyledPressable>
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.price === 'asc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('price', sorting.price === 'asc' ? null : 'asc'); // Toggle "Low to High"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.price === 'asc' && 'text-white'}`}>
                      Low to High
                    </StyledText>
                  </StyledPressable>
                </StyledView>
              </StyledView>

              {/* Sort by Likes */}
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="font-bold text-darkGray w-28" style={{ fontSize: 16 }}>
                  Sort by Likes:
                </StyledText>
                <StyledView className="flex-row space-x-2">
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.likes === 'desc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('likes', sorting.likes === 'desc' ? null : 'desc'); // Toggle "High to Low"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.likes === 'desc' && 'text-white'}`}>
                      High to Low
                    </StyledText>
                  </StyledPressable>
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.likes === 'asc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('likes', sorting.likes === 'asc' ? null : 'asc'); // Toggle "Low to High"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.likes === 'asc' && 'text-white'}`}>
                      Low to High
                    </StyledText>
                  </StyledPressable>
                </StyledView>
              </StyledView>

              {/* Sort by Bids */}
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="font-bold text-darkGray w-28" style={{ fontSize: 16 }}>
                  Sort by Bids:
                </StyledText>
                <StyledView className="flex-row space-x-2">
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.bids === 'desc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('bids', sorting.bids === 'desc' ? null : 'desc'); // Toggle "High to Low"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.bids === 'desc' && 'text-white'}`}>
                      High to Low
                    </StyledText>
                  </StyledPressable>
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.bids === 'asc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('bids', sorting.bids === 'asc' ? null : 'asc'); // Toggle "Low to High"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.bids === 'asc' && 'text-white'}`}>
                      Low to High
                    </StyledText>
                  </StyledPressable>
                </StyledView>
              </StyledView>

              {/* Sort by Time */}
              <StyledView className="flex-row justify-between items-center">
                <StyledText className="font-bold text-darkGray w-28" style={{ fontSize: 16 }}>
                  Sort by Time:
                </StyledText>
                <StyledView className="flex-row space-x-2">
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.time === 'desc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('time', sorting.time === 'desc' ? null : 'desc'); // Toggle "Ending Soonest"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.time === 'desc' && 'text-white'}`}>
                      Ending Soonest
                    </StyledText>
                  </StyledPressable>
                  <StyledPressable
                    className={`rounded-lg px-4 border-2 active:opacity-50 ${
                      sorting.time === 'asc' ? 'bg-primary border-primary' : ''
                    }`}
                    onPress={() => {
                      clearSort('time', sorting.time === 'asc' ? null : 'asc'); // Toggle "Newest"
                    }}
                  >
                    <StyledText className={`pt-2 pb-2 font-bold ${sorting.time === 'asc' && 'text-white'}`}>
                      Newest
                    </StyledText>
                  </StyledPressable>
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>
        </Animated.View>
      </StyledView>
    </Modal>

  </StyledView>
  );
};


export default ResultsPage;