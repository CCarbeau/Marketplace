import React, { useState, useRef } from 'react';
import { View, Pressable, Image, Alert, Animated, StyleSheet, Text, ScrollView, ImageBackground, Dimensions } from 'react-native';
import Modal from 'react-native-modal'
import { styled } from 'nativewind';
import icons from '../../../../constants/icons'

const StyledPressable = styled(Pressable)
const StyledImage = styled(Image)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledScrollView = styled(ScrollView)

const { width: screenWidth } = Dimensions.get('window');

interface CategoryModalProps{
    visible: boolean;
    onClose: () => void;
    onSelectCategory: (category:string, genre:string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ visible, onClose, onSelectCategory }) => {
    const [currentPage, setCurrentPage] = useState(''); 
    const [currentSubpage, setCurrentSubpage] = useState('')
    const [theme, setTheme] = useState('')
    const [genre, setGenre] = useState('')
    const slideAnim = useRef(new Animated.Value(0)).current; // Initial value for the animation

    const themeOptions = ['Sports Cards', 'Trading Card Games', 'Sports Memorabilia', 'Comics & Manga', 'Toys & Collectibles']
    const sportsOptions = ['Baseball', 'Basketball', 'F1', 'Football', 'Golf', 'Hockey', 'NASCAR', 'Soccer', 'Tennis', 'UFC', 'Wrestling', 'Other Sports']
    const tcgOptions = ['DC Cards', 'Digimon Cards', 'Disney Cards', 'Dragon Ball Cards', 'Flesh and Blood Cards', 'Garbage Pail Kids Cards', 'Magic: The Gathering Cards', 'Marvel Cards', 'MetaZoo Cards', 'Naruto Cards', 'One Piece Cards', 'Pokémon Cards', 'Star Wars Cards', 'Weiß Schwarz Cards', 'Yu-Gi-Oh! Cards']
    const comicsOptions = ['Action Labs Comics', 'DC Comics', 'Demon Slayer Manga', 'Dragon Ball Manga', 'Marvel Comics', 'One Piece Manga', 'One Punch Man Manga', 'Pokémon Manga', 'Yu-Gi-Oh! Manga', 'Other Comics', 'Other Manga']
    const toysOptions = ['Bearbricks', 'DC Figurines', 'Funko', 'G.I. Joe', 'Hess Trucks', 'Hot Wheels', 'Kaws', 'LEGO', 'Marvel Figurines', 'Star Wars Figurines', 'Transformers']

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
        onSelectCategory(category,genre); // Pass selected category back to the parent
        onClose(); // Optionally close the modal after selection
    };

    return(
        <Modal
            isVisible={visible} 
            style={styles.modal}
            onBackdropPress={onClose} 
            swipeDirection="down"
            onSwipeComplete={onClose}
            animationIn="slideInUp"
            animationOut="slideOutDown"
        >
            <StyledView className='flex-1 justify-end' style={{backgroundColor: 'rgba(0, 0, 0, 0.5)',}}>
                <StyledView className='h-5/6 w-full bg-white rounded-xl shadow-black shadow-xl overflow-hidden'>
                    <Animated.View style={{ flexDirection: 'row', width: screenWidth * 3, transform: [{ translateX: slideAnim }] }}>
                        
                        <StyledScrollView style={{ width: screenWidth }}>
                            <StyledPressable onPress={() => onClose()} className='flex w-full h-5 items-center'>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-2'></StyledImage>
                            </StyledPressable>
                            <StyledText className='text-2xl text-primary text-center mt-4 font-bold'>Select a Category</StyledText>
                            <StyledView className='bg-gray mt-2 w-full h-px' />
                            {themeOptions.map((option) => (
                                <React.Fragment>
                                    <StyledPressable
                                        key={option}
                                        onPress={() => {slideToPage({forward: true, page: option}); setGenre(option);}}
                                        className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                    >
                                        <StyledText className='text-xl pl-4'>{option}</StyledText>
                                        <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledView className='bg-gray w-full h-px' />
                                </React.Fragment>
                            ))}
                            <StyledPressable className='flex-row h-10 w-full items-center justify-between'>
                                <StyledText className='text-xl pl-4'>More coming soon!</StyledText>
                            </StyledPressable>
                            <StyledView className='bg-gray w-full h-px'/>
                            <StyledView className='w-full h-32'/>
                        </StyledScrollView>
                    
                        <StyledScrollView style={{ width: screenWidth }}>
                        {currentPage==='Sports Cards' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                       <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>Sports Cards</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView><StyledView className='bg-gray mt-2 w-full h-px' />
                                {sportsOptions.map((option) => (
                                    <React.Fragment>
                                        <StyledPressable
                                            key={option}
                                            onPress={() => {setTheme(option); slideToSubpage({forward: true, subpage: 'cards'})}}
                                            className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                        >
                                            <StyledText className='text-xl pl-4'>{option} Cards</StyledText>
                                            <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </React.Fragment>
                                ))}
                                <StyledView className='w-full h-32'/>
                            </>
                        )}

                        {currentPage==='Trading Card Games' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                       <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>Trading Card Games</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView><StyledView className='bg-gray mt-2 w-full h-px' />
                                {tcgOptions.map((option) => (
                                    <React.Fragment>
                                        <StyledPressable
                                            key={option}
                                            onPress={() => {setTheme(option.split(' ')[0]); slideToSubpage({forward: true, subpage: 'cards'})}}
                                            className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                        >
                                            <StyledText className='text-xl pl-4'>{option}</StyledText>
                                            <StyledImage source={icons.carrotBlack} className='w-5 h-5 mr-4' style={{ transform: [{ rotate: '270deg' }] }}></StyledImage>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </React.Fragment>
                                ))}
                                <StyledPressable className='flex-row mt-2 w-full items-center justify-between' onPress={() => {setTheme('Other TCG & Accessories'); handleCategorySelect('Other TCG & Accessories')}}>
                                    <StyledText className='text-xl pl-4'>Other TCG Cards & Accessories</StyledText>
                                </StyledPressable>
                                <StyledView className='bg-gray mt-2 w-full h-px' />
                                <StyledView className='w-full h-32'/>
                            </>
                        )}

                        {currentPage==='Sports Memorabilia' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>Sports Memorabilia</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView><StyledView className='bg-gray mt-2 w-full h-px' />
                                {sportsOptions.map((option) => (
                                    <React.Fragment key={option}>
                                    {option === "Other Sports" ? (
                                      <StyledPressable
                                        onPress={() => {
                                          setTheme(option);
                                          handleCategorySelect(option + ' Memorabilia');
                                        }}
                                        className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                      >
                                        <StyledText className='text-xl pl-4'>{option} Memorabilia</StyledText>
                                      </StyledPressable>
                                    ) : (
                                      <StyledPressable
                                        onPress={() => {
                                          setTheme(option);
                                          slideToSubpage({ forward: true, subpage: 'memorabilia' });
                                        }}
                                        className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                      >
                                        <StyledText className='text-xl pl-4'>{option} Memorabilia</StyledText>
                                        <StyledImage 
                                          source={icons.carrotBlack} 
                                          className='w-5 h-5 mr-4' 
                                          style={{ transform: [{ rotate: '270deg' }] }} 
                                        />
                                      </StyledPressable>
                                    )}
                                    <StyledView className='bg-gray w-full h-px' />
                                  </React.Fragment>
                                ))}
                                <StyledView className='w-full h-32'/>
                            </>
                        )}

                        {currentPage==='Comics & Manga' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                    <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>Comics & Manga</StyledText>
                                    <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView><StyledView className='bg-gray mt-2 w-full h-px' />
                                {comicsOptions.map((option) => (
                                    <React.Fragment>
                                        <StyledPressable
                                            key={option}
                                            onPress={() => {handleCategorySelect(option)}}
                                            className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                        >
                                            <StyledText className='text-xl pl-4'>{option}</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </React.Fragment>
                                ))}
                                <StyledView className='w-full h-32'/>
                            </>
                        )}

                        {currentPage==='Toys & Collectibles' && (
                           <>
                            <StyledView className='flex-row justify-between'>
                                <StyledPressable onPress={() => slideToPage({forward: false, page:'category'})} className='flex h-5'>
                                <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                </StyledPressable>
                                <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>Comics & Manga</StyledText>
                                <StyledPressable onPress={() => {onClose(); slideToPage({forward: false, page:'category'});}}className='mt-4 mr-4'>
                                    <StyledImage source={icons.x} className='w-5 h-5'/>
                                </StyledPressable>
                            </StyledView><StyledView className='bg-gray mt-2 w-full h-px' />
                            {toysOptions.map((option) => (
                                <React.Fragment>
                                    <StyledPressable
                                        key={option}
                                        onPress={() => {handleCategorySelect(option)}}
                                        className='flex-row h-10 w-full items-center justify-between active:bg-gray'
                                    >
                                        <StyledText className='text-xl pl-4'>{option}</StyledText>
                                    </StyledPressable>
                                    <StyledView className='bg-gray w-full h-px' />
                                </React.Fragment>
                            ))}
                            <StyledView className='w-full h-32'/>
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
                                <StyledPressable onPress={() => {handleCategorySelect(theme+' Singles')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                    <StyledText className='text-xl pl-4'>{theme} Singles</StyledText>
                                </StyledPressable>
                                <StyledView className='bg-gray w-full h-px' />
                                <StyledPressable onPress={() => {handleCategorySelect(theme+' Lot')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                    <StyledText className='text-xl pl-4'>{theme} Lot</StyledText>
                                </StyledPressable>
                                <StyledView className='bg-gray w-full h-px' />
                                <StyledPressable onPress={() => {handleCategorySelect(theme+' Wax')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                    <StyledText className='text-xl pl-4'>{theme} Wax</StyledText>
                                </StyledPressable>
                                <StyledView className='bg-gray w-full h-px' />
                                <StyledPressable onPress={() => {handleCategorySelect(theme+' Break')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                    <StyledText className='text-xl pl-4'>{theme} Break</StyledText>
                                </StyledPressable>
                                <StyledView className='bg-gray w-full h-px' />
                            </>
                        )}

                        {currentSubpage === 'memorabilia' && (
                            <>
                                <StyledView className='flex-row justify-between'>
                                    <StyledPressable onPress={() => slideToSubpage({forward: false, subpage: ''})} className='flex h-5'>
                                        <StyledImage source={icons.carrotBlack} className='w-5 h-5 mt-4 ml-4' style={{ transform: [{ rotate: '90deg' }] }}></StyledImage>
                                    </StyledPressable>
                                    <StyledText className='text-2xl mt-4 items-center text-primary font-bold'>{theme} Memorabilia</StyledText>
                                    <StyledPressable onPress={() => onClose()} className='mt-4 mr-4'>
                                        <StyledImage source={icons.x} className='w-5 h-5'/>
                                    </StyledPressable>
                                </StyledView>
                                <StyledView className='bg-gray mt-2 w-full h-px' />

                                {theme==='Baseball' &&(
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Bats')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Bats</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+'s')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme}s</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Helmets')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Helmets</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Jerseys')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Jerseys</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}
                                
                                {theme==='Basketball' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+'s')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme}s</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Jerseys')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Jerseys</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Shoes')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Shoes</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='F1' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Bodywork')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Bodywork</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Flags')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Flags</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Helmets')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Helmets</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Model Cars')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Shoes</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Wheels')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Wheels</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='Football' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+'s')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme}s</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Cleats')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Cleats</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Helmets')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Helmets</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Jerseys')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Jerseys</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Wheels')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='Golf' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Bags')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Bags</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Balls')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Balls</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Clubs')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Clubs</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Flags')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Flags</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='Hockey' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Helmets')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Helmets</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Jerseys')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Jerseys</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Pucks')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Pucks</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Sticks')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Sticks</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}  

                                {theme==='NASCAR' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Bodywork')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Bodywork</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Flags')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Flags</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Helmets')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Helmets</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Model Cars')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Shoes</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Wheels')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Wheels</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='Soccer' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Balls')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Balls</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Cleats')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Cleats</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Jerseys')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Jerseys</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='Tennis' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Balls')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Balls</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Racquets')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Racquets</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Shirts')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Shirts</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Shoes')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Shoes</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='UFC' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Belts')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Belts</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Gloves')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Gloves</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Shorts')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Shorts</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}

                                {theme==='Wrestling' && (
                                    <>
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Belts')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Belts</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Photos')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Photos</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Robes')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Robes</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect(theme+' Singlets')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>{theme} Singlets</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                        <StyledPressable onPress={() => {handleCategorySelect('Other '+theme+' Memorabilia')}} className='flex-row h-10 w-full items-center justify-between active:bg-gray'>
                                            <StyledText className='text-xl pl-4'>Other {theme} Memorabilia</StyledText>
                                        </StyledPressable>
                                        <StyledView className='bg-gray w-full h-px' />
                                    </>
                                )}      
                            </>
                        )}
                        </StyledScrollView>
                        
                    </Animated.View>
                </StyledView>
            </StyledView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
      justifyContent: 'flex-end',
      margin: 0, // Ensures modal takes full width of the screen
    },
});


export default CategoryModal;