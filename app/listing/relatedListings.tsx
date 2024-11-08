import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Image, Pressable } from 'react-native';
import { styled } from 'nativewind';
import icons from '../../constants/icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../src/auth/firebaseConfig';

const StyledPressable = styled(Pressable);
const StyledImageBackground = styled(ImageBackground);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledText = styled(Text);

interface Listing {
  images: string[];
  title: string;
  description: string;
  price: number;
  quantity: number;
  listingType: 'fixed' | 'auction';
  bids?: number;
  duration?: string;
  createdAt?: RawTimestamp;
  id: string;
  likes: number;
}

interface RawTimestamp {
  _seconds: string;
  _nanoseconds: string;
}

interface Seller {
  username: string;
  pfp: string;
  rating: number;
  numberOfFollowers: number;
  itemsSold: number;
  listings: string[];
  id: string;
}

interface Layout {
  height: number;
  width: number;
}

interface RenderRelatedListingsProps {
  relatedListings: Listing[];
  router: any;
  layout: Layout;
  calcTimeRemaining: Function;
  convertToDate: Function;
}

const RenderRelatedListings: React.FC<RenderRelatedListingsProps> = ({
  relatedListings,
  router,
  layout,
  calcTimeRemaining,
  convertToDate,
}) => {
    const [signedIn, setSignedIn] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setSignedIn(true);
            } else {
                setSignedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);
  // State to track which listings are liked
  const [likedListings, setLikedListings] = useState<{ [key: string]: boolean }>({});
  const [likesCount, setLikesCount] = useState<{ [key: string]: number }>(
    relatedListings.reduce((acc, listing) => {
      acc[listing.id] = listing.likes;
      return acc;
    }, {} as { [key: string]: number })
  );

  const toggleLike = async (listingId: string) => {
    if(signedIn){
        const isLiked = likedListings[listingId] || false;
        const newLikesCount = isLiked ? likesCount[listingId] - 1 : likesCount[listingId] + 1;

        try {
        // Update the likes count in Firebase
        const listingRef = doc(db, 'listings', listingId);
        await updateDoc(listingRef, {
            likes: increment(isLiked ? -1 : 1), // Increment or decrement the number of likes
        });

        // Update the local state
        setLikedListings(prevState => ({
            ...prevState,
            [listingId]: !isLiked,
        }));
        setLikesCount(prevState => ({
            ...prevState,
            [listingId]: newLikesCount,
        }));
        } catch (error) {
        console.error('Error updating likes:', error);
        }
    }else{
        router.push('/(auth)/')
    }
  };



  return relatedListings ? (
    relatedListings.map((listing, index) => {
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
                    onPress={() => toggleLike(listing.id)}
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
              <StyledText className="font-bold text-xl" numberOfLines={2}>
                {listing.title}
              </StyledText>
              <StyledText className="text-darkGray" numberOfLines={2}>
                {listing.description}
              </StyledText>
              <StyledText className="text-lg font-bold mt-1">${listing.price}</StyledText>
              {listing.listingType === 'auction' && listing.createdAt ? (
                <StyledView className="flex-row items-center">
                  {listing.bids === 1 ? (
                    <StyledText className="text-md text-darkGray">{listing.bids} Bid • </StyledText>
                  ) : (
                    <StyledText className="text-md text-darkGray">{listing.bids} Bids • </StyledText>
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
    <StyledText>No other listings found</StyledText>
  );
};

export default RenderRelatedListings;