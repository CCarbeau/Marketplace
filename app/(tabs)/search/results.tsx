import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { styled } from 'nativewind';
import {liteClient as algoliasearch, MultipleQueriesResponse} from 'algoliasearch/lite';
import { Listing } from '@/types/interfaces';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const ALGOLIA_APP_ID = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY;
const ALGOLIA_INDEX_NAME = 'listings_index';

const ResultsPage = ({ route }) => {
  const { query } = route.params;
  const [searchResults, setSearchResults] = useState<Listing[]>([]);

  const ALGOLIA_APP_ID = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID;
  const ALGOLIA_SEARCH_API_KEY = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY;
  const ALGOLIA_INDEX_NAME = 'listings_index';

  if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY || !ALGOLIA_INDEX_NAME) {
    console.error('Algolia environment variables are missing.');
    return null;
  }

  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { results }: MultipleQueriesResponse = await client.search({
          requests: [
            {
              indexName: ALGOLIA_INDEX_NAME,
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
        }));
  
        setSearchResults(mappedResults);
      } catch (error) {
        console.error('Error fetching Algolia results:', error);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <ScrollView>
      <StyledView className="p-4">
        {searchResults.map((item) => (
          <StyledView key={item.id} className="mb-4">
            <StyledImage
              source={{ uri: item.images[0] }}
              className="h-60 rounded-lg"
            />
            <StyledText className="text-lg font-bold mt-2">{item.title}</StyledText>
            <StyledText className="text-gray-600 mt-1">{item.description}</StyledText>
            <StyledText className="text-xl font-bold mt-1">${item.price}</StyledText>
          </StyledView>
        ))}
      </StyledView>
    </ScrollView>
  );
};

export default ResultsPage;