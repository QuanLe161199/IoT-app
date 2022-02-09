import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet, Text, StatusBar } from "react-native";

import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import HouseList from "./screens/HouseList";
import HouseManager from "./screens/HouseManager";
import UserManager from "./screens/UserManager";
import RoomList from "./screens/RoomList";
import DeviceManager from "./screens/DeviceManager";

import { LogBox } from "react-native";

// turn off the warning notification
LogBox.ignoreLogs([
    "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

LogBox.ignoreLogs([
    "Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue on Android as it keeps the timer module awake, and timers can only be called when the app is in the foreground. See https://github.com/facebook/react-native/issues/12981 for more info.",
]);

LogBox.ignoreLogs([
    "[Unhandled promise rejection: FirebaseError: Expected type 'Da', but it was: a custom Ua object]",
]);

LogBox.ignoreLogs([
    'Warning: Each child in a list should have a unique "key" prop.',
]);

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="House List" component={HouseList} />
                <Stack.Screen name="House Manager" component={HouseManager} />
                <Stack.Screen name="User Manager" component={UserManager} />
                <Stack.Screen name="Room List" component={RoomList} />
                <Stack.Screen name="Device Manager" component={DeviceManager} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
