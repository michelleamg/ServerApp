import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/view/home/home';  // Asegúrate de tener la ruta correcta
import Register from './src/view/Register/Register';  // Asegúrate de tener la ruta correcta

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ title: 'Bienvenido' }}
        />
        <Stack.Screen 
          name="Register" 
          component={Register} 
          options={{ title: 'Registro' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
