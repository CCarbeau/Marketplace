import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ImageBackground, FlatList, Dimensions, Alert, Animated, Platform, ScrollView, StyleSheet, ActivityIndicator, TouchableHighlight, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '@/firebaseConfig'; // Import your storage instance
import { getAuth, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import icons from '../../constants/icons';
import { SceneMap, TabBar, TabBarProps, TabView } from 'react-native-tab-view';

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledImageBackground = styled(ImageBackground)
const StyledScrollView = styled(ScrollView)

interface Listing {
    images: string[]; // Save all download URLs
    title: string; // Default to empty string if title is missing
    description: string;
    price: number;
    quantity: number;
    category: string;
    genre: string;
  
    // Optional fields for specific categories and genres
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
    duration?: string; // Only present if listingType is 'auction'
    offerable: boolean;
    scheduled: boolean;
    date?: string; // Only present if scheduled is true
    time?: string; // Only present if scheduled is true
    shippingType: 'flat' | 'variable';
    weight?: number; // Only present if shippingType is 'variable'
    shippingProfile?: string; // Only present if shippingType is 'variable'
    shippingCost?: number; // Only present if shippingType is 'flat'
    
    likes: number;
    ownerUID: string; // Assuming it's coming from the request body
    createdAt: Timestamp;
    random: number; // Random number for Firestore querying
}

interface ListingPageProps {
    id?: string;  // The 'id' can be optional since you might use it from the search params
}

interface Details {
    [key: string]: any; // Allows any string key with any value type
}

interface Seller {
    username: string,
    pfp: string,
    rating: number,
    feedback: string[],
    followers: number, 
    itemsSold: number,
    listings: string[],
}
  

const ListingPage: React.FC<ListingPageProps> = ({id : propId}) => {
    const params = useLocalSearchParams();
    const id = propId || (Array.isArray(params.id) ? params.id[0] : params.id);
    const [modal, setModal] = useState(false);
    const [listing, setListing] = useState<Listing | null>(null);
    const [details, setDetails] = useState<Details>({});
    const [seller, setSeller] = useState<Seller | null>(null);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = React.useState(0);
    const layout = useWindowDimensions();
    const [routes] = React.useState([
        { key: 'first', title: 'Details' },
        { key: 'second', title: 'Seller' },
    ]);

  
    
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);

    const [ signedIn, setSignedIn ] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const docRef = doc(db, "listings", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Listing;

                    setListing(data);
                    if(propId){setModal(true);}

                    const includeIfDefined = (key: string, value: string | string[] | undefined | null) => (value !== undefined && value !== null ? { [key]: value } : {});
        
                    setDetails({
                        category: data.category,
                        genre: data.genre,
                        ...includeIfDefined('athlete', data.athlete),
                        ...includeIfDefined('brand', data.brand),
                        ...includeIfDefined('athletes', data.athletes),
                        ...includeIfDefined('team', data.team),
                        ...includeIfDefined('teams', data.teams),
                        ...includeIfDefined('year', data.year !== undefined && data.year !== null ? data.year.toString() : undefined),
                        ...includeIfDefined('set', data.set),
                        ...includeIfDefined('features', data.features),
                        ...includeIfDefined('parallel', data.parallel),
                        ...includeIfDefined('printRun', data.printRun !== undefined && data.printRun !== null ? data.printRun.toString() : undefined),
                    });
                    
                    

                    if (data.listingType === 'auction' && data.createdAt) {
                        const createdAtDate = data.createdAt.toDate(); // Convert Firestore Timestamp to Date
                        startCountdown(createdAtDate, Number(data.duration));
                    }
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

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

    useEffect(() => {
        const fetchSeller = async () => {
            if (listing){
                try {
                    const docRef = doc(db, 'userData', listing.ownerUID)
                    const docSnap = await getDoc(docRef); 
           
                    setSeller(docSnap.data() as Seller);
                }catch{
                    console.error('Cannot fetch seller')
                }
            }
        }
        
        fetchSeller();
    },[listing])

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

    const handleComment = () => {
        // Handle comment logic
    };

    const handleProfile = () => {
        // Handle profile logic
    };

    const handleFollow = () => {
        // Handle follow logic
    };

    const handlePurchase = () => {
        Alert.alert('purchase initiated')
    }

    const handleOffer = () => {

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

    const DetailsTab = () => {   
        if (!details || Object.keys(details).length === 0) {
            return <StyledText>No details available.</StyledText>;
        }
        return (
            <StyledView className=''>
                {Object.keys(details).map((key, index, array) => (
                    <React.Fragment key={key}>
                        <StyledView className='flex-row items-center mr-4 ml-4 mt-1 justify-between'>
                            <StyledText className='text-lg'>{key.charAt(0).toLocaleUpperCase() + key.slice(1)}: </StyledText>
                            <StyledText className='text-lg font-bold'>{details[key]}</StyledText>
                        </StyledView>
                        {index !== array.length - 1 && (  
                            <StyledView className='mt-1 mr-4 ml-4 h-0.5 rounded-xl bg-gray' />
                        )}
                        <StyledText className='text-lg'>{key.charAt(0).toLocaleUpperCase() + key.slice(1)}: </StyledText>
                            <StyledText className='text-lg font-bold'>{details[key]}</StyledText>
                  </React.Fragment>
                  
                ))}
                
            </StyledView> 
        )  
    }

    const SellerTab = () => {
        if(seller){
            return (
                <StyledView className='mr-2 ml-2'>
                    <StyledView className='border border-2 border-gray rounded-xl'> 
                        {seller.pfp ? (
                            <StyledImage source={{uri: seller.pfp}}/>
                        ):(
                            <StyledImage source={icons.circle} className='w-16 h-16'/>
                        )}
                        
                        <StyledText className='text-lg ml-2'>{seller.username}</StyledText>
                    </StyledView>
                </StyledView>  
            )
        }
         
        return (
            <StyledView className='justify-center items-center'>
                <StyledText className='text-xl'>Seller cannot be found</StyledText>
            </StyledView>
        )
    }

    const renderScene = SceneMap({
        first: DetailsTab,
        second: SellerTab,
    });

    const renderTabBar = (props: TabBarProps<any>) => (
        <TabBar
          {...props}
          
          indicatorStyle={{ 
            backgroundColor: '#FF5757', 
            height: 4, 
            borderRadius: 10,  
            width: '30%', 
            left: ((layout.width - 16) / 2 - (layout.width -16)*.3) / 2,
        }}
          style={{ 
            backgroundColor: 'transparent',
            marginBottom: 8,
             
        }}
          activeColor='#FF5757'
          inactiveColor='#777777'
          labelStyle={{
            fontSize: 18, 
            fontWeight: 'bold',
            marginBottom: 0,
        }}
        />
    );

    if (loading) {
        return (
            <StyledView className='flex h-full w-full justify-center items-center'>
                <ActivityIndicator size="large" color="#FF5757"/>
            </StyledView>
        );
    }

    if (!listing) {
        return <Text>No listing found!</Text>;
    }

    return (
        <StyledView className='flex-1 w-full bg-white rounded-2xl'>
            {/* Main ScrollView for the entire page */}
            <ScrollView>
                <TouchableHighlight>
                    <StyledView className='bg-white rounded-2xl'>
                        {/* Image Background */}
                        <StyledImageBackground source={{ uri: listing.images[0] }} className='h-[448]' imageStyle={{ ...(modal ? { borderTopRightRadius: 16, borderTopLeftRadius: 16 } : {}) }}>
                            <StyledPressable onPress={() => { handleLike(id, listing.likes) }} className='flex-row absolute bg-black right-4 bottom-2 rounded-full'>
                                <StyledText className='text-white pl-2 text-xl font-bold self-center'>{listing.likes}</StyledText>
                                {!isLiked ? (
                                    <StyledImage source={icons.heartEmpty} className='w-6 h-6 m-2' />
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
    
                        {/* TabView */}
                        <StyledView className='ml-2 mr-2 mt-2 shadow-sm shadow-gray bg-darkerWhite rounded-xl'>
                            <TabView
                                navigationState={{ index, routes }}
                                renderScene={renderScene}
                                onIndexChange={setIndex}
                                renderTabBar={renderTabBar}
                                
                            />
                        </StyledView>
                        
                        {/* Spacer to add some space at the bottom */}
                        <StyledView className='w-full bg-black mt-2 h-16' />
                    </StyledView>
                </TouchableHighlight>
            </ScrollView>
    
            {/* Fixed Button Area */}
            <StyledView className='absolute bottom-0 w-full shadow-md shadow-black bg-white'>
                <StyledView className='flex-1 flex-row mb-2 justify-between gap-x-2 ml-2 mr-2 mb-8'>
                    {listing.listingType === 'fixed' ? (
                        <StyledView className='flex-1 flex-row basis-2/3 mt-2 bg-black rounded-2xl justify-center items-center shadow-sm shadow-gray'>
                            <StyledPressable
                                className='flex-1 flex-row basis-2/3 bg-primary active:bg-primaryDark rounded-2xl overflow-hidden justify-center items-center'
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
                        </StyledView>
                    ) : (
                        <StyledView className='flex-1 flex-row basis-2/3 mt-2 bg-black rounded-2xl justify-center items-center shadow-sm shadow-gray'>
                            <StyledPressable
                                className='flex-1 flex-row basis-2/3 bg-primary active:bg-primaryDark rounded-2xl overflow-hidden justify-center items-center'
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
                                <StyledText className='pl-8 text-white text-2xl text-center border-2 shadow-sm shadow-gray'>Bid</StyledText>
                            </StyledPressable>
                        </StyledView>
                    )}
                    {listing.offerable && (
                        <StyledView className='flex-1 mt-2 bg-black rounded-2xl justify-center basis-1/3 shadow-sm shadow-black'>
                            <StyledPressable className='flex-1 bg-black rounded-2xl justify-center basis-1/3' onPress={handleOffer}>
                                <StyledText className='text-white text-2xl text-center'>Offer</StyledText>
                            </StyledPressable>
                        </StyledView>
                    )}
                </StyledView>
            </StyledView>
        </StyledView>
    );
    
};

export default ListingPage;