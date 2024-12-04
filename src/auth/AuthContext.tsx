import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { AuthContextProps, ActiveUser } from '@/types/interfaces';
import { doc, updateDoc } from 'firebase/firestore';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const AuthContext = createContext< AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ActiveUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);
  
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);  
      } else {
        setProfile(null);
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  
  const fetchUserProfile = async (uid: string) => {
    try {
      // Fetch the active user profile
      const profileResponse = await fetch(`${API_URL}/auth/fetch-active-user/?id=${uid}`, {
        method: 'GET',
      });
  
      if (!profileResponse.ok) {
        throw new Error(`Error fetching active user ${profileResponse.status}`);
      }
  
      const profileData = await profileResponse.json();
  
      // Fetch the user's conversations
      const conversationsResponse = await fetch(`${API_URL}/sellers/fetch-conversations/?id=${uid}`, {
        method: 'GET',
      });
  
      if (!conversationsResponse.ok) {
        throw new Error(`Error fetching conversations ${conversationsResponse.status}`);
      }
  
      const conversationsData = await conversationsResponse.json();
  
      // Combine profile data with conversations
      const combinedProfile = {
        ...profileData,
        conversations: conversationsData.conversations || [],
      };
  
      // Update the profile in state
      setProfile(combinedProfile);
    } catch (error) {
      console.error('Error fetching user profile or conversations:', error);
    }
  };
  

  const updateProfile = async (updatedData: Partial<ActiveUser>) => {
    setProfile((prevProfile) => {
      if (!prevProfile) {
        return null;
      }
  
      // Merge local profile with updated data
      return { ...prevProfile, ...updatedData };
    });

    if (updatedData.conversations) {
      return;
    }
  
    try {
      // Update Firestore document
      const userId = profile?.id; // Ensure `id` corresponds to Firestore document ID
      if (userId) {
        const userDocRef = doc(db, 'userData', userId);
        await updateDoc(userDocRef, updatedData);
        console.log('Profile updated successfully in Firestore');
      }
    } catch (error) {
      console.error('Error updating profile in Firestore:', error);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
      setLoading(true);
      try {
      await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
      console.error('Error signing in:', error);
      } finally {
      setLoading(false);
      }
  };

  // Sign up
  const signUp = async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      username: string,
      interests: string[]
  ) => {
      setLoading(true);

      try {
          // Sign up the user with Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Send additional user data to the backend to store in Firestore
          const response = await fetch(`${API_URL}/seller/register-user`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${await user.getIdToken()}`,  // Pass Firebase token for backend verification
              },
              body: JSON.stringify({
                  uid: user.uid,
                  email: user.email,
                  firstName,
                  lastName,
                  username,
                  interests,
              }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Error registering user metadata.');
          }

          // Optionally, store user data in context for use across the app
          setUser(user);
          
      } catch (error) {
          console.error('Error during sign up:', error);
      } finally {
          setLoading(false);
      }
  };

  

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};