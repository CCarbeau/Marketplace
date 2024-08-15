import { View, Text, TextInput, Image, Pressable } from 'react-native'
import React from 'react'
import { styled } from 'nativewind'

import icons from "../../constants/icons.js"

const search = () => {
  const StyledPressable = styled(Pressable)
  const StyledImage = styled(Image)
  const StyledView = styled(View)
  const StyledText = styled(Text)
  const StyledTextInput = styled( TextInput )

  return (
    <StyledView className = "flex flex-row mt-16 h-12 w-full align-center justify-center">
      <StyledView className = "flex flex-row w-3/4 border-2 border-black rounded-full align-center">
        <StyledImage source={icons.search} className="h-5 w-5 mt-3 ml-3"/>
        <StyledTextInput className = "ml-4 w-3/4" placeholderTextColor="black" placeholder='Search'/>
      </StyledView>
    </StyledView>
  )
}

export default search