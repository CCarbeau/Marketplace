import { 
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Stack } from 'expo-router/stack';

const { Navigator } = createMaterialTopTabNavigator(); 
import { withLayoutContext } from "expo-router";

export const MaterialTobTabs = withLayoutContext<
MaterialTopTabNavigationOptions,
typeof Navigator,
TabNavigationState<ParamListBase>,
MaterialTopTabNavigationEventMap
>(Navigator);

const TopTabLayout = () => {

    return (
        <MaterialTobTabs 
            screenOptions={{
                tabBarStyle: {
                    position: 'relative',
                    top: -48,
                    height: 0,
                    zIndex: -1000,
                     
                }
            }}
        >
            <MaterialTobTabs.Screen name="index" options={{
                title:"Index"
            }}>
            </MaterialTobTabs.Screen>
            
            <MaterialTobTabs.Screen name="messages" options={{
                title:"Messages"
            }}>
            </MaterialTobTabs.Screen>
        </MaterialTobTabs>
    )
}

export default TopTabLayout;