import React, {use, useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../App';
import useViewModel from './ViewModel';



export const HomeScreen = () => {
  const { email, password, onChange } = useViewModel();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
 
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../../assets/duelofondo.png')}  
        style={styles.imageBackground}
      />

      <View style={styles.logocontainer}>
        <Text style={styles.welcomeText}>¡BIENVENIDO!</Text>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../../../assets/duelingo.png')}
            style={styles.logoimage}
          />
        </View>
        
        {/* "Mi Duelo" en negro y centrado */}
        <Text style={styles.appNameText}>Mi Duelo</Text>
      </View>
  

      <View style={styles.form}>
        <Text style={styles.formText}> Ingresar </Text>
        
        <View style={styles.inputContainer}>
          <Image source={require('../../../../assets/email.png')} style={styles.inputIcon} />
          <TextInput 
            style={styles.textInput} 
            placeholder='Correo Electrónico' 
            keyboardType='email-address'
            value={email}
            onChangeText={text => onChange('email', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image source={require('../../../../assets/password.png')} style={styles.inputIcon} />
          <TextInput 
            style={styles.textInput} 
            placeholder='Contraseña' 
            secureTextEntry={true} // Para ocultar la contraseña
            value={password}
            onChangeText={text => onChange('password', text)}
          />
        </View> 

        <TouchableOpacity style={styles.loginButton} onPress={() => {
          console.log('Email:', email);
          console.log('Password:', password);
        }}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  form: {
    width: '90%',
    maxWidth: 350,
    height: '50%',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 2, // Borde alrededor del formulario
    //borderBottomLeftRadius: 40,
    //borderBottomRightRadius: 40,
  },
  logocontainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: '15%',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'sans-serif',
    marginBottom: 10,
  },
  logoWrapper: {
    borderWidth: 5,
    borderColor: '#234fa7ff',
    borderRadius: 100,
    padding: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  logoimage: {
    width: 150,
    height: 150,
  },
  appNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black', // Negro para el texto
    fontFamily: 'sans-serif',
    left:'25%',
    marginTop: 10, // Espacio entre el logo y el texto
  },
  formText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'sans-serif',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    paddingBottom: 10,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    paddingLeft: 10,
    fontSize: 16,
  },
  inputIcon: {
    width: 25,
    height: 25,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  registerText: {
    fontSize: 14,
    color: 'black',
  },
  registerLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
