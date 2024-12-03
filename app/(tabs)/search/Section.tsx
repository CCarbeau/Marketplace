import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { Listing, RawTimestamp } from '@/types/interfaces';
import icons from '@/constants/icons';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledText = styled(Text);
const StyledView = styled(View);

const Section = ({
  title,
  fetchUrl,
  router,
}: {
  title: string;
  fetchUrl: string;
  router: any;
}) => {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(fetchUrl);
        const data = await response.json();
        setListings(data.listings || []);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      }
    };

    fetchListings();
  }, [fetchUrl]);

  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes: { [key: string]: string } = {};

      listings?.forEach((listing) => {
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
  }, [listings]);

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

  return (
    <StyledView className="mb-4">
      <StyledText className="text-lg font-bold mb-2">{title}</StyledText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {listings.map((listing) => (
          <StyledPressable
            key={listing.id}
            className="pr-1 w-32"
            onPress={() => {
              router.push(`/listing/${listing.id}`);
            }}
          >
            {title === 'Bring Your Wallet' && (
              <>
                <StyledImage
                  className="h-40 w-full bg-gray rounded-xl"
                  source={{ uri: listing.images[0] }}
                />
                <StyledText className="text-md font-bold mt-1 h-9" numberOfLines={2}>
                  {listing.title}
                </StyledText>
                <StyledText className="text-gray mt-1 -mb-1" numberOfLines={1}>
                  {listing.bidCount} Bids | {remainingTimes[listing.id] || "Calculating..."}
                </StyledText>
                <StyledText className="font-bold text-lg" numberOfLines={1}>
                  ${listing.price}
                </StyledText>
              </>
            )}

            {title === 'Heavily Contested' && (
              <>
                <StyledImage
                  className="h-40 w-full bg-gray rounded-xl"
                  source={{ uri: listing.images[0] }}
                />
                <StyledText className="text-md font-bold mt-1 h-9" numberOfLines={2}>
                  {listing.title}
                </StyledText>
                <StyledText className="text-gray mt-1 -mb-1" numberOfLines={1}>
                  ${listing.price} | {remainingTimes[listing.id] || "Calculating..."}
                </StyledText>
                <StyledText className="font-bold text-lg" numberOfLines={1}>
                  {listing.bidCount} Bids
                </StyledText>
              </>
            )}
            
            {title === 'Attention Hogs' && (
              <>
              <StyledImage
                className="h-40 w-full bg-gray rounded-xl"
                source={{ uri: listing.images[0] }}
              />
              <StyledText className="text-md font-bold mt-1 h-9" numberOfLines={2}>
                {listing.title}
              </StyledText>
              <StyledText className="text-gray mt-1 -mb-1" numberOfLines={1}>
                ${listing.price} | {remainingTimes[listing.id] || "Calculating..."}
              </StyledText>
              <StyledView className='flex-row items-center'>
                <StyledText className='font-bold text-lg' numberOfLines={1}>{listing.likes}</StyledText>
                <StyledImage className='w-5 h-5 ml-1' source={icons.heartFull}/>
              </StyledView>
              </>
            )}

            {title === 'Act Fast!' && (
              <>
                <StyledImage
                  className="h-40 w-full bg-gray rounded-xl"
                  source={{ uri: listing.images[0] }}
                />
                <StyledText className="text-md font-bold mt-1 h-9" numberOfLines={2}>
                  {listing.title}
                </StyledText>
                <StyledText className="text-gray mt-1 -mb-1" numberOfLines={1}>
                  ${listing.price} | {listing.bidCount} Bids
                </StyledText>
                <StyledText className='font-bold text-lg' numberOfLines={1}>{remainingTimes[listing.id] || "Calculating..."} </StyledText> 
              </>
            )}

            {title === 'The New Kids' && (
              <>
                <StyledImage
                  className="h-40 w-full bg-gray rounded-xl"
                  source={{ uri: listing.images[0] }}
                />
                <StyledText className="text-md font-bold mt-1 h-9" numberOfLines={2}>
                  {listing.title}
                </StyledText>
                <StyledText className='text-gray mt-1 -mb-1' numberOfLines={1}>New!</StyledText>
                <StyledText className='font-bold text-lg' numberOfLines={1}>${listing.price}</StyledText> 
              </>
            )}
          </StyledPressable>
        ))}
      </ScrollView>
    </StyledView>
  );
};

export default Section;