import React, { useEffect, useState } from 'react';
import { styled } from 'nativewind';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { auth } from '@/firebaseConfig';
const { db } = require('../../firebaseConfig');

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const StyledView = styled(View);

const SellerSignUp = () => {
  const [accountLink, setAccountLink] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // Fetch the Stripe onboarding link from your backend
    const fetchAccountLink = async () => {
      try {
        const response = await fetch(`${API_URL}/create-stripe-account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'user@example.com', // Replace with the actual user email
          }),
        });

        const data = await response.json();
        setAccountLink(data.accountLink); // This is the Stripe onboarding link
        setLoading(false);
      } catch (error) {
        console.error('Error fetching account link:', error);
      }
    };

    fetchAccountLink();
  }, []);

  if (loading) {
    return (
      <StyledView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5757" />
      </StyledView>
    );
  }

  return (
    <>
      <StyledView className='h-12 w-full bg-white'/>
      <StyledView className='h-full w-full bg-black'>
        <StyledView className='flex-1 overflow:hidden'>
          {accountLink ? (
            <WebView
              source={{ uri: accountLink }}
              style={ styles.webView }
              onNavigationStateChange={(navState) => {
                // Handle navigation to return_url after onboarding completion
                if (navState.url === `${API_URL}/(tabs)/profile`) {
                  console.log('Onboarding completed');
                  updateAccount();
                  router.push('/(tabs)/profile');
                }
              }}
            />
          ) : (
            <ActivityIndicator size="large" color="#FF5757" />
          )}
        </StyledView>
      </StyledView>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
  },
});

const updateAccount = async () => {
  try {
    const response = await fetch(`${API_URL}/newSeller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: auth.currentUser?.uid,   
        token: auth.currentUser?.getIdToken(),
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Account updated:', data.message);
    } else {
      
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

export default SellerSignUp;
