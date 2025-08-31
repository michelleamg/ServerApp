import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {HomeScreen} from './src/Presentation/view/home/home';
import Register from './src/Presentation/view/register/register';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="Register" 
          component={Register} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
