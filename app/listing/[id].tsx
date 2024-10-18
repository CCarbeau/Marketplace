import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, ImageBackground, Animated, ScrollView, ActivityIndicator, TouchableHighlight, useWindowDimensions, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '@/firebaseConfig'; // Import your storage instance
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import icons from '../../constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SellerTab from './sellerTab';
import RenderRelatedListings from './relatedListings';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImageBackground = styled(ImageBackground);

interface Listing {
  images: string[];
  title: string;
  description: string;
  price: number;
  quantity: number;
  category?: string;
  athlete?: string;
  team?: string;
  year?: number;
  brand?: string;
  set?: string;
  features?: string[];
  parallel?: string;
  printRun?: number;
  cardsInLot?: number;
  athletes?: string[];
  teams?: string[];
  listingType: 'fixed' | 'auction';
  bids?: number;
  duration?: string;
  offerable?: boolean;
  scheduled?: boolean;
  date?: string;
  time?: string;
  shippingType?: 'flat' | 'variable';
  weight?: number;
  shippingProfile?: string;
  shippingCost?: number;
  likes: number;
  ownerUID?: string;
  createdAt?: RawTimestamp;
  id: string;
  random?: number;
}

interface RawTimestamp{
    _seconds: string,
    _nanoseconds: string,
}

interface ListingPageProps {
  id?: string;
}

interface Details {
  [key: string]: any;
}

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

const ListingPage: React.FC<ListingPageProps> = ({ id: propId }) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    const params = useLocalSearchParams();
    const id = propId || (Array.isArray(params.id) ? params.id[0] : params.id);
    const [modal, setModal] = useState(false);
    const [listing, setListing] = useState<Listing | null>(null);
    const [otherListings, setOtherListings] = useState<Listing []>([]);
    const [details, setDetails] = useState<Details>({});
    const [seller, setSeller] = useState<Seller | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0); // For custom tab control
    const layout = useWindowDimensions();
    const animatedValue = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [tabHeights, setTabHeights] = useState(new Animated.Value(100));
    const [reviews, setReviews] = useState<Review []>([]);
    const [refreshing, setRefreshing] = React.useState(false);
   
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);
    const [signedIn, setSignedIn] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/fetch-listings-by-id?id=${id}`, {
                    method: 'GET',
                });
        
                if (!response.ok) {
                    throw new Error(`Error fetching other listings: ${response.status}`);
                }
        
                const data = await response.json();
                console.log(data);
                const listing = data.listing as Listing

                setListing(listing);
                

                if(propId){setModal(true);}

                const includeIfDefined = (key: string, value: string | string[] | undefined | null) => (value !== undefined && value !== null ? { [key]: value } : {});
    
                setDetails({
                    category: listing.category,
                    ...includeIfDefined('athlete', listing.athlete),
                    ...includeIfDefined('brand', listing.brand),
                    ...includeIfDefined('athletes', listing.athletes),
                    ...includeIfDefined('team', listing.team),
                    ...includeIfDefined('teams', listing.teams),
                    ...includeIfDefined('year', listing.year !== undefined && listing.year !== null ? listing.year.toString() : undefined),
                    ...includeIfDefined('set', listing.set),
                    ...includeIfDefined('features', listing.features),
                    ...includeIfDefined('parallel', listing.parallel),
                    ...includeIfDefined('printRun', listing.printRun !== undefined && listing.printRun !== null ? listing.printRun.toString() : undefined),
                });

                if (listing.listingType === 'auction' && listing.createdAt) {
                    const createdAtDate = convertToDate(listing.createdAt._seconds, listing.createdAt._nanoseconds) // Convert Firestore Timestamp to Date
                    startCountdown(createdAtDate, Number(listing.duration));
                }

            } catch (error) {
                console.error('Cannot fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, refreshing]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setSignedIn(true);
            } else {
                setSignedIn(false);
            }
        });

        return () => unsubscribe();
    }, [refreshing]);

    // MOVE TO BACKEND AND ADD SELLER ID TERM
    useEffect(() => {
        const fetchSeller = async () => {
            if (listing){
                try{
                    setLoading(true);
                    const response = await fetch(`${API_URL}/fetch-seller?id=${listing.ownerUID}`, {
                        method: 'GET',
                    });
    
                    if (!response.ok) {
                        throw new Error(`Error fetching seller: ${response.status}`);
                    }
    
                    const data = await response.json();
                    setSeller(data.seller)
                }catch(error){
                    console.log('Cannont fetch seller', error)
                }finally{
                    setLoading(false);
                }
            }
        }
        
        fetchSeller();
    },[listing, refreshing]) 
    
    useEffect(() => {
        const fetchReviews = async () => {
          if (listing && listing.ownerUID) {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/fetch-reviews?sellerId=${listing.ownerUID}`, {
                    method: 'GET',
                });
        
                if (!response.ok) {
                    throw new Error(`Error fetching reviews: ${response.status}`);
                }
        
                const data = await response.json();
                setReviews(data.reviews || []); // Set the reviews state with the fetched data
            } catch (error) {
                console.error('Cannot fetch reviews:', error);
            } finally {
                setLoading(false); // Stop the loading state whether successful or not
            }
          }
        };
    
        fetchReviews();
      }, [listing, refreshing]);

    useEffect(() => {
    const fetchOtherListings = async () => {
        if (listing && listing.ownerUID) {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/fetch-listings-by-owner?numListings=10&sellerId=${listing.ownerUID}&listingId=${id}`, {
                method: 'GET',
                });
    
                if (!response.ok) {
                throw new Error(`Error fetching other listings: ${response.status}`);
                }
    
                const data = await response.json();
                
                setOtherListings(data.listings || []); 
            } catch (error) {
                console.error('Cannot fetch other listings:', error);
            } finally {
                setLoading(false); // Stop the loading state whether successful or not
            }
        }
    }

    if (otherListings.length === 0){
        fetchOtherListings();
    }
    },[listing, otherListings, refreshing])

    const [relatedListings, setRelatedListings] = useState<Listing[]>([]);

    useEffect(()=> {
        const fetchRelatedListings = async () => {
            if (listing) {
                try {
                    setLoading(true);
                    const response = await fetch(`${API_URL}/fetch-listings-by-category?numListings=10&category=${listing.category}&listingId=${id}`, {
                        method: 'GET',
                    });
        
                    if (!response.ok) {
                        throw new Error(`Error fetching related listings: ${response.status}`);
                    }
        
                    const data = await response.json();
                    
                    setRelatedListings(data.listings || []); 
                } catch (error) {
                    console.error('Cannot fetch related listings:', error);
                } finally {
                    setLoading(false); // Stop the loading state whether successful or not
                }
            }
        }

        if (relatedListings.length === 0 ){
            fetchRelatedListings()
        }
    },[listing, relatedListings, refreshing])

    useEffect(() => {
        if(details){
            setTabHeights(new Animated.Value(Object.keys(details).length*50))
        }
    },[details, refreshing])

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setLoading(true);

        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
      }, []);


    const convertToDate = (seconds: string, nanoseconds: string) => {
        // Convert raw timestamp to milliseconds
        const milliseconds = Number(seconds) * 1000 + Number(nanoseconds) / 1000000;

        // Create a JavaScript Date object
        const date = new Date(milliseconds);

        return date;
    }
    

    const handleLike = async (docId: string, currentLikes: number) => {
        if (signedIn) {
            try {
                setIsLiked(!isLiked);
                const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
                const docRef = doc(db, "listings", docId.toString());
                
                await updateDoc(docRef, { likes: newLikes });
        
                // Update the local state to reflect the new like count
                setListings(prevListings =>
                    prevListings.map(listing =>
                        id === docId ? { ...listing, likes: newLikes } : listing
                    )
                );
            } catch (error) {
                console.error("Error updating likes:", error);
            }
        } else {
            router.push('/(auth)/')
        }
    };

    const handleMessage = () => {
       Alert.alert('Message initiated')
    };

    const handleProfile = (id: string) => {
        Alert.alert('Profle initiated')
    };

    const handleFollow = () => {
        Alert.alert('Follow initiated')
    };

    const handlePurchase = () => {
        Alert.alert('purchase initiated')
    }

    const handleOffer = () => {

    }

    const handleCustomBid = () => {

    }

    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

    const startCountdown = (createdAt: Date, duration: number) => {
        const endTime = new Date(createdAt.getTime() + duration * 24 * 60 * 60 * 1000); 

        const updateCountdown = () => {
            const now = new Date();
            const timeDiff = endTime.getTime() - now.getTime();

            if (timeDiff <= 0) {
                setTimeRemaining("Auction Ended");
                clearInterval(intervalId); // Clear the interval when the auction ends
                return;
            }

            // Calculate remaining time
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            if (days>1){
                setTimeRemaining(`${days} Days`);
            }else if(days===1){
                setTimeRemaining(`${days} Day ${hours}h`)
            }else if(hours > 0){
                setTimeRemaining(`${hours}h ${minutes}m`)
            }else if(minutes>0){
                setTimeRemaining(`${minutes}m ${seconds}s`)
            }else{
                setTimeRemaining(`${seconds}s`)
            }
        };

        // Run every second
        const intervalId = setInterval(updateCountdown, 1000);

        // Initial call to show the time immediately
        updateCountdown();

        // Cleanup the interval when the component unmounts
        return () => clearInterval(intervalId);
    };

    const calcTimeRemaining = (createdAt: Date, duration: number) => {
        const endTime = new Date(createdAt.getTime() + duration * 24 * 60 * 60 * 1000); 

        const now = new Date();
        const timeDiff = endTime.getTime() - now.getTime();

        if (timeDiff <= 0) {
            return ('Ended');
        }

        // Calculate remaining time
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        if (days>1){
            return(`${days} Days`);
        }else if(days===1){
            return(`${days} Day ${hours}h`)
        }else if(hours > 0){
            return(`${hours}h ${minutes}m`)
        }else if(minutes>0){
            return(`${minutes}m ${seconds}s`)
        }else{
            return(`${seconds}s`)
        }
    };

    const DetailsTab = () => (
        <StyledView className='ml-4 mr-4 mt-2'>
            {Object.keys(details).length ? (
                Object.keys(details).map((key,index,array) => (
                <React.Fragment key={key}>
                    <StyledView className="flex-row justify-between">
                        <StyledText className="text-lg">{key.charAt(0).toUpperCase() + key.slice(1)}:</StyledText>
                        <StyledText className="text-lg font-bold">{details[key]}</StyledText>
                    </StyledView>
                    {index !== array.length - 1 && (  
                        <StyledView className='mt-1 h-0.5 rounded-xl bg-gray' />
                    )}
                </React.Fragment>
                ))
            ) : (
                <StyledText>No details available.</StyledText>
            )}
        </StyledView>
    );

    const handleTabPress = (index: number) => {
        if(index !== activeTab){
            setActiveTab(index);

            Animated.spring(animatedValue, {
                toValue: index * layout.width,
                useNativeDriver: true,
            }).start();
    
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: index * layout.width, animated: true });
            }
        }
    };

    const onScroll = (event: any) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        animatedValue.setValue(scrollX / 2); // Update animated value for the indicator

        const index = scrollX/(layout.width-16)
        setActiveTab(Math.round(index));

        let reviewExists = 0;
        let otherListingsExists = 0;

        if(reviews){
            reviewExists = 1;
        }

        if(otherListings){
            otherListingsExists = 1
        }

        var toHeight = Object.keys(details).length * 50 + index * (125+200*reviewExists+370*otherListingsExists-Object.keys(details).length*50)
        

        Animated.timing(tabHeights, {
            toValue: toHeight, // Increase modal height when complete
            duration: 300,
            useNativeDriver: false,
        }).start();
        
    };

    const indicatorTranslateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1], // Adjust this to match the movement across tabs
    });  

    const [progress] = useState(new Animated.Value(0));

    const handlePressIn = () => {
        Animated.timing(progress, {
        toValue: 1,
        duration: 1500, // 3 seconds for full color change
        useNativeDriver: false,
        }).start(({ finished }) => {
        if(finished){
            handlePurchase();
        }
        });
    };

    const handlePressOut = () => {
        Animated.timing(progress, {
        toValue: 0,
        duration: 500, // quickly reset to the initial state
        useNativeDriver: false,
        }).start();
    };

    // Interpolate the background color of the button
    const animatedWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'], // Start at 0% width and grow to 100%
    });

    if (loading) {
        return (
        <StyledView className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF5757" />
        </StyledView>
        );
    }

    if (!listing) {
        return <StyledText>No listing found!</StyledText>;
    }

    return (
        <StyledView className="flex-1 w-full bg-white rounded-2xl">
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
                {/* How to render page in the home screen (need TouchableHighlight for scrollview to work)*/}
                {modal ? (
                    <TouchableHighlight>       
                        <StyledView className="bg-white rounded-2xl">
                            <StyledImageBackground source={{ uri: listing.images[0] }} className='h-[448]' imageStyle={{ ...(modal ? { borderTopRightRadius: 16, borderTopLeftRadius: 16 } : {}) }}>
                                <StyledPressable onPress={() => { handleLike(id, listing.likes) }} className='flex-row absolute bg-black right-4 bottom-2 rounded-full'>
                                    <StyledText className='text-white pl-2 text-xl font-bold self-center'>{listing.likes}</StyledText>
                                    {!isLiked ? (
                                        <StyledImage source={icons.heartEmpty} className='w-6 h-6 m-2' style={{tintColor:'#FF5757'}}/>
                                    ) : (
                                        <StyledImage source={icons.heartFull} className='w-6 h-6 m-2' />
                                    )}
                                </StyledPressable>
                            </StyledImageBackground>
                            <StyledView className="p-4">
                                <StyledText className="text-3xl font-bold mt-2">{listing.title}</StyledText>
                                <StyledText className="text-gray-600">{listing.description}</StyledText>
                                <StyledView className="flex-row mt-4 items-center">
                                    <StyledText className="text-xl font-bold">${listing.price}</StyledText>
                                    <StyledText className="text-gray-600 pl-2">+ $x shipping + taxes</StyledText>
                                </StyledView>
                            </StyledView>
                    
                            {/* Custom Tab Header */}
                            <StyledView className="bg-darkerWhite rounded-xl mr-2 ml-2 mt-2">
                                <StyledView className="flex-row justify-around">
                                    <StyledPressable onPress={() => handleTabPress(0)} className="p-2 mt-2 w-20">
                                    <StyledText className={`text-center font-bold text-lg ${activeTab === 0 ? 'text-primary' : 'text-gray'}`}>
                                        Details
                                    </StyledText>
                                    </StyledPressable>
                                    <StyledPressable onPress={() => handleTabPress(1)} className='p-2 mt-2 w-20'>
                                    <StyledText className={`text-center font-bold text-lg ${activeTab === 1 ? 'text-primary' : 'text-gray'}`}>
                                        Seller
                                    </StyledText>
                                    </StyledPressable>
                        
                                    {/* Indicator */}
                                    <Animated.View
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        height: 4,
                                        left: (layout.width - 16) / 4 - (layout.width - 16) / 6,
                                        width: (layout.width - 16) / 3,
                                        backgroundColor: '#FF5757',
                                        borderRadius: 24,
                                        transform: [{ translateX: indicatorTranslateX }],
                                    }}
                                    />
                                </StyledView>
                    
                                {/* Tab Content */}
                                <Animated.View style={{ height: tabHeights }}>
                                    <ScrollView
                                    ref={scrollViewRef}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    onScroll={onScroll}
                                    scrollEventThrottle={16}
                                    nestedScrollEnabled={true}
                                    >
                                    {/* Tab Content */}
                                    <View style={{ width: layout.width - 16 }}>
                                        {/* Details Tab Content */}
                                        <DetailsTab />
                                    </View>
                                    <View style={{ width: layout.width - 16 }}>
                                        {/* Seller Tab Content */}
                                        <SellerTab 
                                            seller = {seller}
                                            handleProfile={handleProfile}
                                            reviews={reviews}
                                            layout={{height: layout.height, width: layout.width}}
                                            otherListings={otherListings}
                                            router={router}
                                            calcTimeRemaining={calcTimeRemaining}
                                            convertToDate={convertToDate}
                                        />
                                    </View>
                                    </ScrollView>
                                </Animated.View>
                            </StyledView>
                            <StyledView className="w-full bg-white mt-2 h-64" />
                        </StyledView>
                    </TouchableHighlight> 
                ):(
                // NON MODAL VIEW 
                    <StyledView className="bg-white rounded-2xl">
                        <StyledImageBackground source={{ uri: listing.images[0] }} className='h-[496]' imageStyle={{ ...(modal ? { borderTopRightRadius: 16, borderTopLeftRadius: 16 } : {}) }}>
                            <SafeAreaView>
                                <StyledPressable className='ml-4 bg-darkGray active:bg-gray rounded-full w-8 h-8 justify-center' onPress={() => {router.back()}}>
                                    <StyledImage source={icons.carrot} style={{transform: [{ rotate: '270deg' }]}} className='ml-1 w-5 h-5'/>
                                </StyledPressable>
                            </SafeAreaView>
                            <StyledPressable onPress={() => { handleLike(id, listing.likes) }} className='flex-row absolute bg-darkGray right-4 bottom-2 rounded-full'>
                                <StyledText className='text-white pl-2 text-xl font-bold self-center'>{listing.likes}</StyledText>
                                {!isLiked ? (
                                    <StyledImage source={icons.heartEmpty} className='w-6 h-6 m-2' style={{tintColor:'#FF5757'}}/>
                                ) : (
                                    <StyledImage source={icons.heartFull} className='w-6 h-6 m-2' />
                                )}
                            </StyledPressable>
                        </StyledImageBackground>
    
                        {/* Listing Details */}
                        <StyledView className='w-full pl-4 pr-4'>
                            <StyledText className='text-3xl font-bold mt-2'>{listing.title}</StyledText>
                            <StyledText className='text-gray'>{listing.description}</StyledText>
                            <StyledView className='flex flex-row mt-4'>
                                <StyledText className='text-xl font-bold'>${listing.price}</StyledText>
                                <StyledText className='text-gray pl-2 self-center'>+ $x shipping+taxes</StyledText>
                            </StyledView>
                            {listing.listingType === 'fixed' ? (
                                <StyledView className='flex flex-row'>
                                    <StyledText className='text-lg'>Quantity: </StyledText>
                                    <StyledText className='text-lg font-bold'>{listing.quantity}</StyledText>
                                </StyledView>
                            ) : (
                                <StyledView className='flex flex-row'>
                                    <StyledText className='text-lg'>Time Remaining: </StyledText>
                                    <StyledText className='text-lg text-primary font-bold'>{timeRemaining}</StyledText>
                                </StyledView>
                            )}
                        </StyledView>
                
                        {/* Custom Tab Header */}
                        <StyledView className="bg-darkerWhite rounded-xl mr-2 ml-2 mt-2">
                            <StyledView className="flex-row justify-around">
                                <StyledPressable onPress={() => handleTabPress(0)} className="p-2 mt-2 w-20">
                                <StyledText className={`text-center font-bold text-lg ${activeTab === 0 ? 'text-primary' : 'text-gray'}`}>
                                    Details
                                </StyledText>
                                </StyledPressable>
                                <StyledPressable onPress={() => handleTabPress(1)} className='p-2 mt-2 w-20'>
                                <StyledText className={`text-center font-bold text-lg ${activeTab === 1 ? 'text-primary' : 'text-gray'}`}>
                                    Seller
                                </StyledText>
                                </StyledPressable>
                    
                                {/* Indicator */}
                                <Animated.View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    height: 4,
                                    left: (layout.width - 16) / 4 - (layout.width - 16) / 6,
                                    width: (layout.width - 16) / 3,
                                    backgroundColor: '#FF5757',
                                    borderRadius: 24,
                                    transform: [{ translateX: indicatorTranslateX }],
                                }}
                                />
                            </StyledView>
                
                            {/* Tab Content */}
                            <Animated.View style={{ height: tabHeights }}>
                                <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onScroll={onScroll}
                                scrollEventThrottle={16}
                                nestedScrollEnabled
                                >
                                    <StyledView style={{ width: layout.width - 16 }}>
                                        {/* Details Tab Content */}
                                        <DetailsTab />
                                    </StyledView>
                                    <StyledView style={{ width: layout.width - 16 }}>
                                        {/* Seller Tab Content */}
                                        <SellerTab 
                                            seller = {seller}
                                            handleProfile={handleProfile}
                                            reviews={reviews}
                                            layout={{height: layout.height, width: layout.width}}
                                            otherListings={otherListings}
                                            router={router}
                                            calcTimeRemaining={calcTimeRemaining}
                                            convertToDate={convertToDate}
                                        />
                                    </StyledView>
                                </ScrollView>
                            </Animated.View>
                        </StyledView>

                        {/* Related Items Block */}
                        <StyledView className='ml-2 mr-2 mt-8'>
                            <StyledText className='font-bold text-2xl ml-2'>Related Listings</StyledText>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                scrollEventThrottle={16} 
                                style={{ marginTop: 8 }} 
                                removeClippedSubviews={false}

                            >
                                <RenderRelatedListings 
                                    layout={{height: layout.height, width: layout.width}}
                                    relatedListings={relatedListings}
                                    router={router}
                                    calcTimeRemaining={calcTimeRemaining}
                                    convertToDate={convertToDate}
                                />
                            </ScrollView>
                        </StyledView>

                        {/* Report Listing Block */}
                        <StyledView className='mt-8 ml-2 mr-2'>
                            <StyledPressable className='p-4 bg-darkerWhite active:bg-lightGray rounded-xl items-center'>
                                <StyledText className='font-bold text-md text-red-500'>Report Listing</StyledText>
                            </StyledPressable>
                        </StyledView>
                        <StyledView className="w-full bg-white mt-2 h-32" />
                    </StyledView>
                )} 
            </ScrollView>

            {/* Fixed Button Area */}
            <StyledView className='absolute h-20 bottom-0 w-full shadow-md shadow-black bg-white'>
                <StyledView className='flex-row ml-2 mr-2 h-11 justify-between mb-8'>
                    {listing.listingType === 'fixed' ? (
                        <StyledView className='flex-1 flex-row mt-2 bg-black rounded-xl justify-center items-center shadow-sm shadow-gray'>
                            <StyledPressable
                                className='flex-1 flex-row basis-2/3 bg-primary active:bg-primaryDark rounded-xl overflow-hidden justify-center items-center'
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                            >
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        backgroundColor: '#00FF00',
                                        width: animatedWidth,
                                    }}
                                />
                                <StyledText className='text-white text-2xl text-center font-bold shadow-sm shadow-gray'>${listing.price}</StyledText>
                                <StyledText className='pl-8 text-white text-2xl text-center border-2 shadow-sm shadow-gray'>Buy Now</StyledText>
                            </StyledPressable>
                            {listing.offerable && 
                                <StyledPressable 
                                    className='flex-1 flex-row basis-1/3 bg-darkerWhite active:bg-lightGray rounded-xl overflow-hidden justify-center items-center'
                                    onPress={handleOffer}
                                >
                                    <StyledText className='pl-8 text-black text-2xl text-center border-2 shadow-sm shadow-gray'>Offer</StyledText>
                                </StyledPressable>
                            }
                        </StyledView>
                        
                    ) : (
                        <StyledView className='flex-1 flex-row mt-2 rounded-xl shadow-sm shadow-gray gap-x-2'>
                            <StyledPressable
                                className='flex-1 flex-row basis-2/3 bg-primary active:bg-primaryDark rounded-xl overflow-hidden justify-evenly items-center'
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                            >
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        backgroundColor: '#00FF00',
                                        width: animatedWidth,
                                    }}
                                />
                                <StyledText className='text-white text-lg font-bold shadow-sm shadow-gray'>${listing.price}</StyledText>
                                <StyledText className='text-white font-bold text-lg shadow-sm shadow-gray'>Bid</StyledText>
                            </StyledPressable>
                            <StyledPressable 
                                className='flex-1 basis-1/3 bg-darkerWhite active:bg-lightGray rounded-xl justify-center items-center h-full'
                                onPress={handleCustomBid}
                            >
                                <StyledText className='text-black text-lg font-bold text-center border-2'>Custom</StyledText>
                            </StyledPressable>
                        </StyledView>
                    )}
                </StyledView>
            </StyledView>
        </StyledView>
    );
};

export default ListingPage;