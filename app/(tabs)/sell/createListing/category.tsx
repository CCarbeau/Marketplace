import React, { useState, useRef } from 'react';
import { View, Pressable, Image, Alert, Animated, TextInput, Text, ScrollView, ImageBackground, Dimensions, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../../../firebaseConfig';
import { doc, setDoc } from "firebase/firestore"; 
import { styled } from 'nativewind';
import icons from '../../../../constants/icons'

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)
const StyledImageBackground = styled(ImageBackground)
const StyledTextInput = styled(TextInput)

const { width: screenWidth } = Dimensions.get('window');

const CategoryModal = ({ visible, onClose, onSelectCategory }) => {
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [currentPage, setCurrentPage] = useState(''); 
    const [directory, setDirectory] = useState(''); 
    const [currentSubpage, setCurrentSubpage] = useState('')
    const [theme, setTheme] = useState('')
    const slideAnim = useRef(new Animated.Value(0)).current; // Initial value for the animation

  const [category, setCategory] = useState('');
    const slideToPage = ({forward , page}:{forward: boolean, page: string}) => {
        const toValue = forward ? -screenWidth: 0;
    
        Animated.timing(slideAnim, {
          toValue: toValue,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setCurrentPage(page));
    };

    const slideToSubpage = ({forward, subpage}:{forward: boolean, subpage: string}) => {
        const toValue = subpage ? -screenWidth * 2 : -screenWidth;
    
        Animated.timing(slideAnim, {
          toValue: toValue,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setCurrentSubpage(subpage));
    };

    const handleCategorySelect = (category: string) => {
        onSelectCategory(category); // Pass selected category back to the parent
        onClose(); // Optionally close the modal after selection
    };

    return(
        <Modal animationType='slide' transparent={true} visible={visible}>
            <StyledView className='flex-1 bg-opacity-50 justify-end'>
                <StyledView className='h-5/6 w-full bg-white rounded-xl shadow-black shadow-xl overflow-hidden'>
                    <Animated.View style={{ flexDirection: 'row', width: screenWidth * 3, transform: [{ translateX: slideAnim }] }}>
                    
                        <StyledScrollView style={{ width: screenWidth }}>
                            <StyledPressable onPress={() => onClose()} className='flex w-full h-5 items-center'>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-2'></StyledImage>
                            </StyledPressable>
                            <StyledText className='text-2xl text-primary text-center mt-4 font-bold'>Select a Category</StyledText>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                            <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => slideToPage({forward: true, page: 'sportsCards'})}>
                                <StyledText className='text-xl pl-4'>Sports Cards</StyledText>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                            </StyledPressable>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                            <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => slideToPage({forward: true, page:'tradingCards'})}>
                                <StyledText className='text-xl pl-4'>Trading Card Games</StyledText>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                            </StyledPressable>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                            <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => slideToPage({forward: true, page:'sportsMem'})}>
                                <StyledText className='text-xl pl-4'>Sports Memorabilia</StyledText>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                            </StyledPressable>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                            <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => slideToPage({forward: true, page:'comics'})}>
                                <StyledText className='text-xl pl-4'>Comics & Manga</StyledText>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                            </StyledPressable>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                            <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => slideToPage({forward: true, page:'toys'})}>
                                <StyledText className='text-xl pl-4'>Toys & Collectibles</StyledText>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                            </StyledPressable>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                            <StyledPressable className='flex-row mt-2 w-full items-center justify-between'>
                                <StyledText className='text-xl pl-4'>More coming soon!</StyledText>
                            </StyledPressable>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                        </StyledScrollView>
                    
                        <StyledScrollView style={{ width: screenWidth }}>
                        {currentPage==='sportsCards' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                        <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>Sports Cards</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Baseball'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Baseball Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Basketball'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Basketball Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('F1'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>F1 Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Football'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Football Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Golf'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Golf Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Hockey'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Hockey Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('NASCAR'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>NASCAR Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Soccer'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Soccer Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Tennis'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Tennis Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('UFC'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>UFC Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Wrestling'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Wrestling Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Other Sports'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Other Sports Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                            </>
                        )}

                        {currentPage==='tradingCards' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                        <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>Trading Card Games</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('DC'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>DC Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Digimon'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Digimon Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Disney'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Disney Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Dragon Ball'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Dragon Ball Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Flesh and Blood'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Flesh and Blood Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Garbage Pail Kids'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Garbage Pail Kids Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Magic: The Gathering'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Magic: The Gathering Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Marvel'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Marvel Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('MetaZoo'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>MetaZoo Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Naruto'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Naruto Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('One Piece'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>One Piece Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Pokémon'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Pokémon Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Pokémon'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Pokémon Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Star Wars'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Star Wars Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Weiß Schwarz'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Weiß Schwarz Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Yu-Gi-Oh!'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Yu-Gi-Oh! Cards</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Other TCG Cards & Accessories'); slideToSubpage({forward: true, subpage: 'cards'})}}>
                                    <StyledText className='text-xl pl-4'>Other TCG Cards & Accessories</StyledText>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledView className='h-16 w-full'/>
                            </>
                        )}

                        {currentPage==='sportsMem' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                        <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-2 items-center font-bold text-gray'>Sports Memorabilia</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 1</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 2</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option </StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                            </>
                        )}

                        {currentPage==='comics' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                        <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-2 items-center font-bold text-gray'>Comics & Manga</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 1</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 2</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 3</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                            </>
                        )}

                        {currentPage==='toys' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                        <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-2 items-center font-bold text-gray'>Toys & Collectibles</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 1</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 2</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledText className='text-xl pl-4 mt-4'>More Option 3</StyledText>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                            </>
                        )}
                        </StyledScrollView>

                        <StyledScrollView style={{ width: screenWidth }}>
                            {currentSubpage === 'cards' && (
                                <>
                                    <StyledView className='flex-row justify-between'>
                                        <StyledPressable onPress={() => slideToSubpage({forward: false, subpage: ''})} className='flex h-5'>
                                            <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                        </StyledPressable>
                                        <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>{theme} Cards</StyledText>
                                        <StyledPressable onPress={() => onClose()} className='mt-4 mr-4'>
                                            <StyledImage source={icons.x} className='w-5 h-5'/>
                                        </StyledPressable>
                                    </StyledView>
                                    <StyledView className='bg-gray mt-2 w-full h-px' />
                                    <StyledPressable onPress={() => {handleCategorySelect(theme+' Singles')}}>
                                        <StyledText className='text-xl pl-4 mt-4'>{theme} Singles</StyledText>
                                    </StyledPressable>
                                    <StyledView className='bg-gray mt-2 w-full h-px' />
                                    <StyledPressable onPress={() => {handleCategorySelect(theme+' Lot')}}>
                                        <StyledText className='text-xl pl-4 mt-4'>{theme} Lot</StyledText>
                                    </StyledPressable>
                                    <StyledView className='bg-gray mt-2 w-full h-px' />
                                    <StyledPressable onPress={() => {handleCategorySelect(theme+' Wax')}}>
                                        <StyledText className='text-xl pl-4 mt-4'>{theme} Wax</StyledText>
                                    </StyledPressable>
                                    <StyledView className='bg-gray mt-2 w-full h-px' />
                                    <StyledPressable onPress={() => {handleCategorySelect(theme+' Break')}}>
                                        <StyledText className='text-xl pl-4 mt-4'>{theme} Break</StyledText>
                                    </StyledPressable>
                                    <StyledView className='bg-gray mt-2 w-full h-px' />
                                </>
                            )}
                        </StyledScrollView>
                    </Animated.View>
                </StyledView>
            </StyledView>
        </Modal>
        )
}

export default CategoryModal;