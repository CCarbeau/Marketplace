import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Image, Pressable, ImageBackground, Animated, ScrollView, ActivityIndicator, TouchableHighlight, useWindowDimensions, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import icons from '../../constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SellerTab from './sellerTab';
import RenderRelatedListings from './relatedListings';
import RenderBottomBar from './BottomBar';
import { Listing, Seller, Review, ActiveUser, AuthContextProps } from '@/types/interfaces';
import { fetchRandomListings, fetchReviews, fetchSeller } from '../../src/functions/fetch';
import { handleLike, handleReport } from '../../src/functions/userInput';
import { AuthContext } from '@/src/auth/AuthContext';

const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImageBackground = styled(ImageBackground);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ListingPageProps {
  id?: string;
}

interface Details {
  [key: string]: any;
}

const ListingPage: React.FC<ListingPageProps> = ({ id: propId }) => {
    // Utility imports
    const router = useRouter();
    const auth = getAuth();
    const layout = useWindowDimensions();

    // Used for checking if the file is called within a modal or not
    const params = useLocalSearchParams();
    const id = propId || (Array.isArray(params.id) ? params.id[0] : params.id);
    const [modal, setModal] = useState(false);

    // State management 
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user, profile, updateProfile } = useContext(AuthContext) as AuthContextProps; 
    

    {/* useEffect Functions */}

    // Fetch main listing
    const [listing, setListing] = useState<Listing | null>(null);
    const [details, setDetails] = useState<Details>({});
    const [isLiked, setIsLiked] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/listings/fetch-listing-by-id?id=${id}`, {
                    method: 'GET',
                });
        
                if (!response.ok) {
                    throw new Error(`Error fetching listing: ${response.status}`);
                }
        
                const data = await response.json();
                const listing = data.listing as Listing

                setListing(listing);
                
                if(propId){
                    setModal(true);
                }

                if(profile){
                    setIsLiked(profile.liked.includes(listing.id));
                    setIsOwner(profile.id === listing.ownerUID);
                }


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
                setRefreshing(false);
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, refreshing]);

    // Fetch the listing's seller
    const [seller, setSeller] = useState<Seller | null>(null);

    useEffect(() => {
        if (listing) {
          const fetchSellerData = async () => {
            try {
              setLoading(true);
              const ret = await fetchSeller(listing.ownerUID); 
              if (ret) {
                setSeller(ret); 
              } else {
                console.log("Seller data is null or undefined");
              }
            } catch (error) {
              console.log('Cannot fetch seller', error);
            } finally {
              setRefreshing(false);
              setLoading(false);
            }
          };
      
          fetchSellerData(); // Call the async function
        }
      }, [listing, refreshing]);

    // Fetch Seller's Reviews
    const [reviews, setReviews] = useState<Review []>([]);
    
    useEffect(() => {
        const fetchReviewsData = async () => {
            if(listing?.ownerUID){
              try{
                setLoading(true);
      
                const ret = await fetchReviews(listing.ownerUID);
      
                if (ret) {
                  setReviews(ret); // Only set seller if data is returned
                } else {
                  console.log("Seller data is null or undefined");
                }
      
              }catch (error){
                console.log('Error fetching reviews', error);
              }finally{
                setRefreshing(false);
                setLoading(false);
              }
            }
          }
      
          fetchReviewsData();
      }, [listing, refreshing]);


    // Fetch the seller's other listings
    const [otherListings, setOtherListings] = useState<Listing []>([]);

    useEffect(() => {
        const fetchOtherListings = async () => {
            try{
                setLoading(true);
                
                const ret = await fetchRandomListings(listing?.ownerUID, undefined, id, 10, true);

                if(ret){
                    setOtherListings(ret);
                }else{
                    console.log('Other listings returned null')
                }
            }catch(error){
                console.error('Error fetching other listings', error);
            }
        }

        if (otherListings.length === 0){
            fetchOtherListings();
        }
    },[listing, otherListings, refreshing])

    // Fetch related listings
    const [relatedListings, setRelatedListings] = useState<Listing[]>([]);

    useEffect(()=> {
        const fetchRelatedListings = async () => {
            if (listing && listing.category) {
                try {
                    setLoading(true);
                    const ret = await fetchRandomListings(undefined, listing.category, id, 10, true);

                    if(ret){
                        setRelatedListings(ret);
                    }else{
                        console.log('Related listings returned is null')
                    }
                }catch(error){
                    console.error('Cannot fetch related listings', error);
                }
            }
        }

        if (relatedListings.length === 0 ){
            fetchRelatedListings()
        }
    },[listing, id, refreshing])

    // Set the dynamic heights of each tab in the seller/details tabs
    const [tabHeights, setTabHeights] = useState(new Animated.Value(100));

    useEffect(() => {
        if(details){
            setTabHeights(new Animated.Value(Object.keys(details).length*50))
        }
    },[details, refreshing])

    // Refresh function
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
    }, []);
   

    {/* Time Calculation Functions */}

    // Start countdown for auction listings
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

    // Calculate time remaining in auxilary auction items' 
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

    // Convert Timestamp object into Date Object
    const convertToDate = (seconds: string, nanoseconds: string) => {
        // Convert raw timestamp to milliseconds
        const milliseconds = Number(seconds) * 1000 + Number(nanoseconds) / 1000000;

        // Create a JavaScript Date object
        const date = new Date(milliseconds);

        return date;
    }


    {/* Rendering Functions */}

    // Render Details Tab
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

    // Render Title, Description, Price, etc of main listing
    const RenderListingDetails = () => {
        if (!listing){
            return <StyledText className="text-center mt-4">Listing not found</StyledText>; 
        }

        return (
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
        )
    }

    

    // Render Report Listing Button & Bottom Padding
    const RenderReportListing = () => (
        <React.Fragment>
            <StyledView className='mt-8 ml-2 mr-2'>
                <StyledPressable 
                    className='p-4 bg-darkerWhite active:bg-lightGray rounded-xl items-center'
                    onPress={handleReport}    
                >
                    <StyledText className='font-bold text-md text-red-500'>Report Listing</StyledText>
                </StyledPressable>
            </StyledView>
            <StyledView className="w-full bg-white mt-2 h-32" />
        </React.Fragment>
    )

    // Details/Seller Tab Press and Scroll Functions
    const scrollViewRef = useRef<ScrollView | null>(null);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState(0); // For custom tab control

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

    {/* Main Component */}

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
                        
                            {/* Listing Image and Buttons */}
                            <StyledImageBackground source={{ uri: listing.images[0] }} className='h-[496]' imageStyle={{borderTopLeftRadius:16, borderTopRightRadius:16}}>
                                <StyledPressable onPress={() => { handleLike(listing.id, isLiked, profile, router, updateProfile) }} className='flex-row absolute bg-darkGray right-4 bottom-2 rounded-full'>
                                    <StyledText className='text-white pl-2 text-xl font-bold self-center'>{listing.likes}</StyledText>
                                    {!isLiked ? (
                                        <StyledImage source={icons.heartEmpty} className='w-6 h-6 m-2' style={{tintColor:'#FF5757'}}/>
                                    ) : (
                                        <StyledImage source={icons.heartFull} className='w-6 h-6 m-2' />
                                    )}
                                </StyledPressable>
                            </StyledImageBackground>
        
                            {/* Listing Details */}
                            <RenderListingDetails />
                    
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
                            <RenderReportListing />
                        </StyledView>
                    </TouchableHighlight> 
                ):(
                // NON MODAL VIEW 
                    <StyledView className="bg-white rounded-2xl">
                        {/* Listing Image and Buttons */}
                        <StyledImageBackground source={{ uri: listing.images[0] }} className='h-[496]' >
                            <SafeAreaView>
                                <StyledPressable className='ml-4 bg-darkGray active:bg-gray rounded-full w-8 h-8 justify-center' onPress={() => {router.back()}}>
                                    <StyledImage source={icons.carrot} style={{transform: [{ rotate: '270deg' }]}} className='ml-1 w-5 h-5'/>
                                </StyledPressable>
                            </SafeAreaView>
                            <StyledPressable onPress={() => { handleLike(listing.id, isLiked, profile, router, updateProfile) }} className='flex-row absolute bg-darkGray right-4 bottom-2 rounded-full'>
                                <StyledText className='text-white pl-2 text-xl font-bold self-center'>{listing.likes}</StyledText>
                                {!isLiked ? (
                                    <StyledImage source={icons.heartEmpty} className='w-6 h-6 m-2' style={{tintColor:'#FF5757'}}/>
                                ) : (
                                    <StyledImage source={icons.heartFull} className='w-6 h-6 m-2' />
                                )}
                            </StyledPressable>
                        </StyledImageBackground>
    
                        {/* Listing Details */}
                        <RenderListingDetails />
                
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
                        <RenderReportListing />
                    </StyledView>
                )} 
            </ScrollView>

            {/* Fixed Button Area */}
            <StyledView className='absolute h-20 bottom-0 w-full shadow-md shadow-black bg-white'>
                <StyledView className='flex-row ml-4 mr-2 h-11 justify-between mb-8'>
                    <RenderBottomBar 
                        listing={listing}
                        isOwner={isOwner}
                    />
                </StyledView>
            </StyledView>
        </StyledView>
    );
};

export default ListingPage;