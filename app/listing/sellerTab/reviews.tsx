import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { styled } from 'nativewind';
import icons from '../../../constants/icons';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledText = styled(Text);

interface Review {
  reviewerId: string;
  sellerId: string;
  rating: number;
  description: string;
  createdAt: string;
  reviewerPfp: string;
  reviewerUsername: string;
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

interface RenderReviewsProps {
  reviews: Review[];
  seller: Seller;
  handleProfile: (id: string) => void;
  layout: Layout;
}

const RenderReviews: React.FC<RenderReviewsProps> = ({ reviews, seller, handleProfile, layout }) => (
  reviews && seller ? (
    reviews.map((review, index) => (
      <StyledView className='border-2 border-darkGray rounded-2xl p-1 mr-2' key={index} style={{ width: layout.width * 5 / 9 }}>
        <StyledPressable className='active:bg-gray rounded-xl' onPress={() => { handleProfile(review.reviewerId); }}>
          <StyledView className='flex-row items-center justify-between p-1'>
            <StyledView className='flex-row items-center'>
              {seller.pfp ? (
                <StyledImage source={{ uri: seller.pfp }} className="w-10 h-10 rounded-full" />
              ) : (
                <StyledImage source={icons.profile} className="w-10 h-10" />
              )}
              <StyledView className='ml-1'>
                <StyledText className='text-lg'>{seller.username}</StyledText>
                <StyledText className='text-xs mb-1'>{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</StyledText>
              </StyledView>
            </StyledView>
            <StyledView className='flex-row items-center'>
              <StyledText className='text-lg'>{review.rating}</StyledText>
              <StyledImage source={icons.star} style={{ tintColor: '#FF5757' }} className='ml-1 w-5 h-5' />
            </StyledView>
          </StyledView>
        </StyledPressable>
        <StyledView className='w-full mr-1 ml-1'>
          <StyledText numberOfLines={4}>{review.description}</StyledText>
        </StyledView>
      </StyledView>
    ))
  ) : (
    <StyledView className='border-2 border-darkGray rounded-2xl p-1 mr-2 items-center justify-center' style={{ width: layout.width * 5 / 9 }}>
        <StyledText>Reviews not found</StyledText>
    </StyledView>
  )
);

export default RenderReviews;