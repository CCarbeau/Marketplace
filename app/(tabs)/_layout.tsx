import { Image, Text, View, Pressable, ImageSourcePropType } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import { styled } from 'nativewind'

import icons from "../../constants/icons.js"

type TabIconProps = {
  icon: ImageSourcePropType;
  color: string;
  name: string;
  focused: boolean;
};

const TabIcon = ({icon,color,name,focused}:TabIconProps) => {
  const StyledPressable = styled(Pressable)
  const StyledImage = styled(Image)
  const StyledView = styled(View)
  const StyledText = styled(Text)

  return (
    <StyledView>
      <StyledImage 
        source = {icon}
        tintColor={color}
        className="w-7 h-7"
      />
    </StyledView>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#FF5757",
          tabBarInactiveTintColor: "#000000",
          tabBarStyle:{
            borderTopWidth: 1,
            borderTopColor: "#000000",
            backgroundColor: "#f6f6f6"
          }
        }}
      >
        <Tabs.Screen 
        name="home"
          options = {{
            title:"Home",
            headerShown: false,
            tabBarIcon:({ color, focused }) => (
              <TabIcon
                icon = {icons.home}
                color = {color}
                name="Home"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="search"
          options = {{
            title:"Search",
            headerShown: false,
            tabBarIcon:({ color, focused }) => (
              <TabIcon
                icon = {icons.search}
                color = {color}
                name="Search"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="sell"
          options = {{
            title:"Sell",
            headerShown: false,
            tabBarIcon:({ color, focused }) => (
              <TabIcon
                icon = {icons.sell}
                color = {color}
                name="Sell"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="collection"
          options = {{
            title:"Collection",
            headerShown: false,
            tabBarIcon:({ color, focused }) => (
              <TabIcon
                icon = {icons.cards}
                color = {color}
                name="Collection"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="profile"
          options = {{
            title:"Profile",
            headerShown: false,
            tabBarIcon:({ color, focused }) => (
              <TabIcon
                icon = {icons.profile}
                color = {color}
                name="Profile"
                focused={focused}
              />
            )
          }}
        /> 
      </Tabs>
    </>
  )
}

export default TabsLayout