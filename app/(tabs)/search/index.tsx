import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, TextInput, ScrollView, Pressable, Text, Image, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import {liteClient as algoliasearch } from 'algoliasearch/lite';
import { MultipleQueriesResponse } from 'algoliasearch';
import { styled } from 'nativewind';
import { AuthContextProps, Listing, RecentSearch, Seller } from '@/types/interfaces';
import Section from './Section';
import icons from '@/constants/icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AuthContext } from '@/src/auth/AuthContext';
import { handleProfile } from '@/src/functions/userInput';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledView = styled(View);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const Search = () => {
  const textInputRef = useRef<TextInput>(null);
  const router = useRouter();

  const { profile, updateProfile } = useContext(AuthContext) as AuthContextProps;

  // Algolia initialization
  const ALGOLIA_APP_ID = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID;
  const ALGOLIA_SEARCH_API_KEY = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY;

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY) {
    console.error('Algolia environment variables are missing.');
    return null;
  }

  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [listingSuggestions, setListingSuggestions] = useState<string[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<Seller[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

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
    textInputRef.current?.blur(); 
    Keyboard.dismiss(); 
    handleBlur(); 
    setSearchQuery('');
  
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
    textInputRef.current?.blur(); 
    Keyboard.dismiss(); 
    handleBlur(); 
    setSearchQuery('');
  
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

  return (
    <StyledView className="flex-1 p-4 mt-4">
      {/* Search Bar */}
      <StyledView className="absolute right-0 left-0 top-16 flex-row items-center mb-4 justify-center z-20">
          {showOverlay && (
              <StyledPressable 
                  className='absolute left-1' 
                  onPress={() => {
                    textInputRef.current?.blur(); 
                    Keyboard.dismiss(); 
                    handleBlur(); 
                    setShowOverlay(false);
                    setSearchQuery('');
                  }}>
                  <StyledImage
                      source={icons.carrotBlack}
                      className="w-5 h-5"
                      style={{ tintColor: '#FF5757', transform: [{ rotate: '90deg' }] }}
                  />
              </StyledPressable>
            )}
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
      {/* Search Results (Dynamic Suggestions) */}
      
      <ScrollView
        showsVerticalScrollIndicator = {false}
        style={{paddingTop: 96}}
      >
        <Section
          title="Bring Your Wallet"
          fetchUrl={`${API_URL}/listings/fetch-most-expensive`}
          router={router}
        />
        <Section
          title="Heavily Contested"
          fetchUrl={`${API_URL}/listings/fetch-most-bid`}
          router={router}
        />
        <Section
          title="Attention Hogs"
          fetchUrl={`${API_URL}/listings/fetch-most-liked`}
          router={router}
        />
        <Section
          title="Act Fast!"
          fetchUrl={`${API_URL}/listings/fetch-ending-soonest`}
          router={router}
        />
        <Section
          title="The New Kids"
          fetchUrl={`${API_URL}/listings/fetch-most-recent`}
          router={router}
        />
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
  );
};

export default Search;