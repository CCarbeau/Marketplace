import React from 'react';
import { View, Text, Image, Pressable, ScrollView, Alert } from 'react-native';
import { styled } from 'nativewind';
import icons from '../../../constants/icons';
import RenderOtherListings from './otherListings';
import RenderReviews from './reviews';
import { Listing, Seller, Layout, Review } from '@/types/interfaces';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledText = styled(Text);

interface SellerTabProps {
    seller: Seller | null;
    reviews: Review[];
    layout: Layout;
    otherListings: Listing[];
    router: any;
    calcTimeRemaining: (start: Date, duration: number) => string;
    convertToDate: (seconds: string, nanoseconds: string) => Date;
}

const SellerTab: React.FC<SellerTabProps> = ({
    seller,
    reviews,
    layout,
    otherListings,
    router,
    calcTimeRemaining,
    convertToDate
}) => {
    if (!seller) {
        return (
            <StyledView className="justify-center items-center">
                <StyledText className="text-xl">Seller cannot be found</StyledText>
            </StyledView>
        );
    }

    const handleProfile = (id: string) => {
        Alert.alert('Profle initiated')
    };

    return (
        <StyledView className="ml-2 mr-2 mt-4">
            <StyledView className="flex-row h-20">
                <StyledPressable onPress={() => handleProfile(seller.id)}>
                    {seller.pfp ? (
                        <StyledImage source={{ uri: seller.pfp }} className="w-20 h-20 rounded-full border" />
                    ) : (
                        <StyledImage source={icons.profile} className="w-20 h-20" />
                    )}
                </StyledPressable>
                <StyledView className="flex-auto ml-2 mt-1 w-full">
                    <StyledView className="flex-row justify-between">
                        <StyledView>
                            <StyledText className="text-lg font-bold">{seller.username}</StyledText>
                            <StyledText className="text-md">Seller since 2024</StyledText>
                        </StyledView>
                        <StyledView className="flex-row">
                            <StyledPressable
                                className="justify-center items-center bg-black active:bg-gray rounded-2xl mr-2 h-10 w-10"
                                onPress={() => console.log("Follow")}
                            >
                                <StyledImage source={icons.profile} style={{ tintColor: '#FFFFFF' }} className="w-7 h-7" />
                            </StyledPressable>
                            <StyledPressable
                                className="justify-center items-center bg-black active:bg-gray rounded-2xl mr-2 h-10 w-10"
                                onPress={() => console.log("Message")}
                            >
                                <StyledImage source={icons.message} className="h-7 w-7" />
                            </StyledPressable>
                        </StyledView>
                    </StyledView>
                    <StyledView className="flex-row w-3/5 mt-1 justify-between">
                        <StyledView className="flex-row items-center">
                            <StyledText className="text-lg">{seller.numberOfFollowers}</StyledText>
                            <StyledImage source={icons.follower} className="ml-1 w-5 h-5" />
                        </StyledView>
                        <StyledView className="flex-row items-center">
                            <StyledText className="text-lg">{seller.rating}</StyledText>
                            <StyledImage source={icons.star} style={{ tintColor: '#FF5757' }} className="ml-1 w-5 h-5" />
                        </StyledView>
                        <StyledView className="flex-row items-center">
                            <StyledText className="text-lg">{seller.itemsSold}</StyledText>
                            <StyledImage source={icons.sell} style={{ tintColor: '#FF5757' }} className="ml-1 w-5 h-5" />
                        </StyledView>
                    </StyledView>
                </StyledView>
            </StyledView>
            {reviews &&
                <>
                    <StyledView className="mt-4 h-0.5 rounded-xl bg-gray" />
                    <StyledView>
                        <StyledText className="ml-2 text-xl font-bold mt-4">Reviews</StyledText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16} style={{ marginTop: 8 }}>
                            <RenderReviews reviews={reviews} seller={seller} handleProfile={handleProfile} layout={layout} />
                        </ScrollView>
                    </StyledView>
                </>
            }
            {otherListings  &&
                <StyledView>  
                    <StyledText className="ml-2 text-xl font-bold mt-4">More from this Seller</StyledText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16} style={{ marginTop: 8 }} removeClippedSubviews={false}>
                        <RenderOtherListings
                            otherListings={otherListings}
                            seller={seller}
                            router={router}
                            layout={layout}
                            calcTimeRemaining={calcTimeRemaining}
                            convertToDate={convertToDate}
                        />
                    </ScrollView>
                </StyledView>
            }
        </StyledView>
    );
};

export default SellerTab;