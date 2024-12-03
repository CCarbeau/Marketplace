import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, ScrollView, Pressable, Text, Image, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import {liteClient as algoliasearch, MultipleQueriesResponse } from 'algoliasearch/lite';
import { styled } from 'nativewind';
import { Listing } from '@/types/interfaces';
import Section from './Section';
import icons from '@/constants/icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledView = styled(View);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const Search = () => {
  const textInputRef = useRef<TextInput>(null);
  const router = useRouter();

  // Algolia initialization
  const ALGOLIA_APP_ID = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID;
  const ALGOLIA_SEARCH_API_KEY = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY;
  const ALGOLIA_INDEX_NAME = 'listings_index';

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY || !ALGOLIA_INDEX_NAME) {
    console.error('Algolia environment variables are missing.');
    return null;
  }

  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['Laptop', 'Shoes', 'Camera']);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      router.push({
        pathname: '/(tabs)/search/results',
        params: { query },
      });
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const { results } = await client.search({
        requests: [
          {
            indexName: ALGOLIA_INDEX_NAME,
            query,
            hitsPerPage: 5,
          },
        ],
      });
      const newSuggestions = results.map((hit: any) => hit.title);
      setSuggestions(newSuggestions);
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
    setRecentSearches((prev) => [...new Set([query, ...prev])]);
    setShowOverlay(false);
    router.push({ pathname: '/(tabs)/search/results', params: { query } });
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
              onChangeText={setSearchQuery}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search..."
              className="flex-1 text-sm"
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  router.push({
                    pathname: '/(tabs)/search/results',
                    params: { query: searchQuery },
                  });
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
        <StyledView className="absolute top-0 bottom-0 left-0 right-0 bg-white z-10">
          <ScrollView contentContainerStyle={{ padding: 16}}>
            <StyledText className='text-lg font-bold mb-4 mt-24'>Recent Searches</StyledText>
            {recentSearches.map((item, index) => (
              <StyledPressable
                key={index}
                className="flex-row items-center mb-4"
                onPress={() => handleSuggestionPress(item)}
              >
                <StyledImage
                  source={icons.dollar}
                  className="w-5 h-5 mr-4"
                />
                <StyledText className="text-gray-800">{item}</StyledText>
              </StyledPressable>
            ))}

            <StyledText className="text-lg font-bold mt-8 mb-4">Suggestions</StyledText>
            {suggestions.map((item, index) => (
              <StyledPressable
                key={index}
                className="flex-row items-center mb-4"
                onPress={() => handleSuggestionPress(item)}
              >
                <StyledImage
                  source={icons.search}
                  className="w-5 h-5 mr-4"
                />
                <StyledText className="text-gray-800">{item}</StyledText>
              </StyledPressable>
            ))}
          </ScrollView>
        </StyledView>
      )}
    </StyledView>
  );
};

export default Search;