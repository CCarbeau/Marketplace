import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { styled } from 'nativewind';
import React, { useState, useEffect, useContext } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Seller, Message, AuthContextProps } from '@/types/interfaces';
import { AuthContext } from '@/src/auth/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import { fetchSeller } from '@/src/functions/fetch';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledView = styled(View);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const MessagesPage = () => {
  const router = useRouter();
  const { profile } = useContext(AuthContext) as AuthContextProps;
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const layout = useWindowDimensions();

  const recipientId = params.id;

  const [recipient, setRecipient] = useState<Seller | null>(null);
  const [conversation, setConversation] = useState<Message[] | null>(null);
  const [message, setMessage] = useState<string>();
  const [conversationId, setConversationId] = useState<string>();

  useEffect(() => {
    const fetchRecipient = async () => {
      const recipientData = await fetchSeller(String(recipientId));
      setRecipient(recipientData);
      
      const participants = [profile?.id, recipientId].sort()
      setConversationId(participants.join('_'));
    };

    fetchRecipient();
  }, [recipientId]);

  useEffect(()=> {
    const fetchConversationData = async () => {
      const response = await fetch(`${API_URL}/sellers/fetch-messages?conversationId=${conversationId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error fetching listings: ${response.status}`);
      }

      const data = await response.json();
      const conversationData = data.conversation.messageHistory;
      
      setConversation(conversationData.reverse());
    }

    fetchConversationData();
  })

  const handleLoadMore = () => {

  };

  const handleSend = async () => {
    if (message && message.trim().length > 0) {
      const data = {
        message: message,
        senderId: profile?.id,
        recipientId: recipientId, 
      };

      const response = await fetch(`${API_URL}/user-input/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(data),
      })

      if(response.ok){
        setMessage(''); 
        Keyboard.dismiss(); 
      }else{
        console.error('Error sending message');
      }
    }
  }

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderItem = ({item}: {item: Message}) => {
    if(item.sender === profile?.id){
      return (
        <StyledView className='w-full items-end mt-2'>
          <StyledView className='bg-primary rounded-2xl mr-2 p-2 border border-darkGray' style={{maxWidth: layout.width*2/3}}>
            <StyledText className='text-white font-bold'>
              {item.message}
            </StyledText>
          </StyledView>
        </StyledView>
      )
    }else{
      return (
        <StyledView className='w-full items-start'>
          <StyledView className='bg-darkGray border border-darkGray rounded-2xl ml-2 p-2 ' style={{maxWidth: layout.width*2/3}}>
            <StyledText className='text-white font-bold'>
              {item.message}
            </StyledText>
          </StyledView>
        </StyledView>
      )
    }
  }

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF5757" />
      </StyledView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <StyledView className='flex-1'>
            <StyledView className="absolute -top-16 h-28 w-full z-10" style={{ backgroundColor: '#FFFFFF' }}>
              <StyledView className="absolute bottom-2 w-full flex-row items-center justify-center">
                <StyledView className="flex-row items-center justify-center">
                  <StyledImage
                    source={{ uri: recipient?.pfp }}
                    className="h-8 w-8 rounded-full border border-0.5"
                  />
                  <StyledText className="text-lg text-md font-bold text-black ml-2">
                    {recipient?.username}
                  </StyledText>
                </StyledView>
                <StyledPressable className="absolute left-2" onPress={router.back}>
                  <StyledImage
                    source={icons.carrotBlack}
                    className="w-5 h-5"
                    style={{ tintColor: '#FF5757', transform: [{ rotate: '90deg' }] }}
                  />
                </StyledPressable>
              </StyledView>
              <StyledView className="absolute bottom-0 w-full h-px bg-darkWhite" />
            </StyledView>

            <FlatList
              data={conversation}
              renderItem={renderItem}
              keyExtractor={(item) => item.sentAt.toString()}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.2}
              showsVerticalScrollIndicator={false}
              inverted={true}
              initialNumToRender={10}
              style={{
                marginBottom: 72,
                width: layout.width,
              }}
            />

            <StyledView className='absolute bottom-4 w-full bg-white'>
              <StyledView className='w-full h-px bg-lightGray mb-2'/>
              <StyledView
                className="flex-row ml-2 mr-2 justify-center items-end"
                style={{ width: layout.width - 16 }}
              >
                <StyledTextInput
                  className="flex-1 border border-darkGray focus:border-primary rounded-2xl pl-4 pr-2 text-wrap pb-2 bg-darkerWhite"
                  placeholder="Message..."
                  placeholderTextColor={'#424242'}
                  value={message}
                  onChangeText={setMessage}
                  submitBehavior='blurAndSubmit'
                  maxLength={300}
                  multiline={true}
                  onSubmitEditing={handleSend}
                  returnKeyType='send'
                  style={{
                    minHeight: 40,
                    maxHeight: 150, 
                    paddingTop: 10,
                  }}
                />
                <StyledPressable className="border rounded-full w-10 h-10 items-center justify-center ml-1 bg-darkGray">
                  <StyledImage source={icons.camera} className="h-6 w-6" />
                </StyledPressable>
                <StyledPressable className="border rounded-full w-10 h-10 items-center justify-center ml-1 bg-darkGray">
                  <StyledImage
                    source={icons.cards}
                    className="h-6 w-6"
                    style={{ tintColor: '#FFFFFF' }}
                  />
                </StyledPressable>
              </StyledView>
            </StyledView>
            
          </StyledView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MessagesPage;
