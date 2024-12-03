import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ImageBackground, Image, Pressable } from 'react-native';
import { styled } from 'nativewind';
import icons from '../../../constants/icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Listing, Seller, Layout, AuthContextProps } from '@/types/interfaces';
import { handleLike } from '@/src/functions/userInput';
import { AuthContext } from '@/src/auth/AuthContext';

const StyledPressable = styled(Pressable);
const StyledImageBackground = styled(ImageBackground);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledText = styled(Text);

interface RenderOtherListingsProps {
  otherListings: Listing[];
  seller: Seller;
  router: any;
  layout: Layout;
  calcTimeRemaining: Function;
  convertToDate: Function;
}

const RenderOtherListings: React.FC<RenderOtherListingsProps> = ({
  otherListings,
  seller,
  router,
  layout,
  calcTimeRemaining,
  convertToDate,
}) => {
    const auth = getAuth();
    const { user, profile, updateProfile } = useContext(AuthContext) as AuthContextProps; 

  // State to track which listings are liked
  const [likedListings, setLikedListings] = useState<{ [key: string]: boolean }>({});
  const [likesCount, setLikesCount] = useState<{ [key: string]: number }>(
    otherListings.reduce((acc, listing) => {
      acc[listing.id] = listing.likes;
      return acc;
    }, {} as { [key: string]: number })
  );
  

  return otherListings && seller ? (
    otherListings.map((listing, index) => {
      const isLiked = likedListings[listing.id] || false;

      return (
        <StyledPressable
          key={listing.id}
          className="flex"
          onPress={() => { router.push(`/listing/${listing.id}`); }}
        >
          <StyledView className="rounded-2xl p-1 mr-2" style={{ width: layout.width / 2 }}>
            <StyledView className="self-center">
              {listing.images ? (
                <StyledImageBackground
                  source={{ uri: listing.images[0] }}
                  style={{ width: layout.width / 2, height: layout.height / 4 }}
                  imageStyle={{borderRadius:16}}
                  className="rounded-xl"
                >
                  <StyledPressable
                    className='flex-row absolute bg-darkGray right-2 top-2 rounded-full'
                    onPress={() => handleLike(listing.id, isLiked, profile, router, updateProfile)}
                  >
                    <StyledText className='text-white pl-2 text-lg font-bold self-center'>{listing.likes}</StyledText>
                    <StyledImage
                      source={isLiked ? icons.heartFull : icons.heartEmpty}
                      style={{ tintColor: '#FF5757' }}
                      className='w-5 h-5 m-2'
                    />
                  </StyledPressable>
                </StyledImageBackground>
              ) : (
                <StyledImageBackground
                  source={icons.profile}
                  style={{ width: layout.width / 2, height: layout.height / 4 }}
                  className="rounded-xl"
                />
              )}
            </StyledView>
            <StyledView className="mt-2">
              <StyledText className="font-bold text-lg" numberOfLines={2}>
                {listing.title}
              </StyledText>
              <StyledText className="text-darkGray" numberOfLines={2}>
                {listing.description}
              </StyledText>
              <StyledText className="text-lg font-bold mt-1">${listing.price}</StyledText>
              {listing.listingType === 'auction' && listing.createdAt ? (
                <StyledView className="flex-row items-center">
                  {listing.bids === 1 ? (
                    <StyledText className="text-md text-darkGray">{listing.bidCount} Bid • </StyledText>
                  ) : (
                    <StyledText className="text-md text-darkGray">{listing.bidCount} Bids • </StyledText>
                  )}
                  <StyledText className="font-bold text-primary text-md">
                    {calcTimeRemaining(
                      convertToDate(listing.createdAt._seconds, listing.createdAt._nanoseconds),
                      Number(listing.duration)
                    )}
                  </StyledText>
                </StyledView>
              ) : (
                <StyledText className="text-md text-darkGray">Qty: {listing.quantity}</StyledText>
              )}
            </StyledView>
          </StyledView>
        </StyledPressable>
      );
    })
  ) : (
    <StyledView className="rounded-2xl p-1 mr-2 border-darkGray" style={{ width: layout.width / 2 }}>
      <StyledImage 
        source={icons.profile} 
        style={{ width: layout.width / 2, height: layout.height / 4 }}
        className="rounded-xl"/>
      <StyledView className="mt-2">
        <StyledText className="font-bold text-lg" numberOfLines={2}>
          Seller has no other listings
        </StyledText>
      </StyledView>
    </StyledView>
  );
};

export default RenderOtherListings;