import { View, Text, FlatList, Pressable, Image } from 'react-native'
import React from 'react'
import { styled } from 'nativewind'
import { Link } from "expo-router"
import { SafeAreaView } from 'react-native-safe-area-context'

const messages = () => {
  const StyledPressable = styled(Pressable)
  const StyledImage = styled(Image)
  const StyledView = styled(View)
  const StyledText = styled(Text)

  return (
    <StyledView className = "flex flex-row bg-black w-full h-full justify-center">
      <StyledView className = "flex flex-row mt-16 w-3/4 h-12 gap-x-16 justify-center">
          <StyledText className = "text-white font-bold">Messages</StyledText>
      </StyledView>
    </StyledView>
  )
}

export default messages