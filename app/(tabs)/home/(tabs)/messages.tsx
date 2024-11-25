import { View, Text, Pressable, Image, Alert, ScrollView, ImageBackground, Animated, useWindowDimensions, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Listing, Seller, Review, AuthContextProps, Message, Conversation } from '@/types/interfaces';
import { AuthContext } from '@/src/auth/AuthContext';
import icons from '@/constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
    MaterialTopTabNavigationProp,
} from '@react-navigation/material-top-tabs';
import { formatDistanceToNow } from 'date-fns';

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledSafeAreaView = styled(SafeAreaView);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type TopTabParamList = {
    index: undefined;
    messages: undefined;
};

const messages = () => {
    const router = useRouter();
    const { profile, updateProfile } = useContext(AuthContext) as AuthContextProps; 
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const params = useLocalSearchParams();
    const layout = useWindowDimensions();

    const [following, setFollowing] = useState(false);
    const [conversations, setConversations] = useState<Conversation[] | undefined>([])
    const [interlocutor, setInterlocutor] = useState<Seller>();

    const navigation = useNavigation<MaterialTopTabNavigationProp<TopTabParamList>>();

    const handleNavigateToHome = () => {
        navigation.navigate('index'); 
    };

    useEffect(() => {
        const fetchConversations = async () => {
            const response = await fetch(`${API_URL}/sellers/fetch-conversations?id=${profile?.id}`, {
                method: 'GET',
            })

            if(!response.ok){
                throw new Error('Error fetching conversations')
            }

            const data = await response.json();
            setConversations(data.conversations);
        }

        fetchConversations();
    }, [profile?.id])

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        setTimeout(() => {
        setRefreshing(false);
        }, 2000);
    }, []);

    const handleLoadMore = () => {

    }

    const renderItem = ({ item }: { item: Conversation }) => {
        const lastUpdated = new Date(Number(item.updatedAt._seconds) * 1000);
    
        return (
            <StyledPressable className="flex h-24 w-full" onPress={() => { router.push(`/messages/${item.interlocutor.id}`) }}>
                <StyledView className="flex-1 flex-row items-center ml-4">
                    <StyledImage className="border rounded-full w-16 h-16" source={{ uri: item.interlocutor.pfp }} />
                    <StyledView className="flex-1 h-14 justify-start ml-4 mr-4">
                        <StyledView className="flex-row justify-between">
                            <StyledText className="font-bold text-large">{item.interlocutor.username}</StyledText>
                            <StyledText>{formatDistanceToNow(lastUpdated, { addSuffix: true })}</StyledText>
                        </StyledView>
                        <StyledText className="text-darkGray">{item.lastMessage}</StyledText>
                    </StyledView>
                </StyledView>
                <StyledView className="w-full h-px bg-darkerWhite" />
            </StyledPressable>
        );
    };

    return (
        <StyledView className='flex-1'>
            <StyledView className="absolute top-0 h-24 w-full" style={{ backgroundColor: '#FFFFFF'}}>
                <StyledView className="absolute bottom-2 w-full flex-row items-center justify-center" style={{backgroundColor: '#FFFFFF'}}>
                    <StyledView className="flex-row items-center justify-center">
                    <StyledText className="text-lg font-bold text-black ml-2">
                        Messages
                    </StyledText>
                    </StyledView>
                    <StyledPressable 
                        className="absolute left-2" 
                        onPress={() => {
                            handleNavigateToHome();
                    }}>
                    <StyledImage
                        source={icons.carrotBlack}
                        className="w-5 h-5"
                        style={{ tintColor: '#FF5757', transform: [{ rotate: '90deg' }] }}
                    />
                    </StyledPressable>
                </StyledView>
                <StyledView className='absolute w-full bottom-0 h-px bg-darkWhite'/>
            </StyledView>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                style={{marginTop: 96}}
            />

            
            
        </StyledView>
    )
}

export default messages