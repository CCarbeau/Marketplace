import { 
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";

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
            tabBarActiveTintColor:"blue",
            tabBarStyle:{
                backgroundColor:'transparent',
                position:"absolute",
            }

        }}>
            <MaterialTobTabs.Screen name="index" options={{
                title:"Following"
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