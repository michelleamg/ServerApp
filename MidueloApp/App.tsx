import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {HomeScreen} from './src/Presentation/view/home/home';
import Register from './src/Presentation/view/register/register';
import WelcomeScreen from './src/Presentation/view/Bienvenida/bienvenido';
import Termsandconditions from './src/Presentation/view/cartayterminos/TandC';
import InicioTestScreen from './src/Presentation/view/TestDuelo/Inicio';
import { TestFormScreen } from './src/Presentation/view/TestDuelo/TestParteUno';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Welcome: undefined;
  TermsAndConditions: undefined;
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Register" component={Register} />
  <Stack.Screen name="Welcome" component={WelcomeScreen} />
  <Stack.Screen name="TermsAndConditions" component={Termsandconditions} />
  <Stack.Screen name="InicioTest" component={InicioTestScreen}  />
  <Stack.Screen name="ParteUno" component={TestFormScreen}  />

</Stack.Navigator>

    </NavigationContainer>
  );
};

export default App;
