import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../App';

export default function App() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../../assets/duelofondo.png')}  
        style={styles.imageBackground}
      />

  
      <View style={styles.form}>
        <Text style={styles.formText}>Registro de Paciente</Text>

        <View style={styles.inputContainer}>
          <Image source={require('../../../../assets/email.png')} style={styles.inputIcon} />
          <TextInput 
            style={styles.textInput} 
            placeholder='Nombre' 
          />
        </View>

        <View style={styles.inputContainer}>
          <Image source={require('../../../../assets/email.png')} style={styles.inputIcon} />
          <TextInput 
            style={styles.textInput} 
            placeholder='Correo Electrónico' 
            keyboardType='email-address' 
          />
        </View>

        <View style={styles.inputContainer}>
          <Image source={require('../../../../assets/password.png')} style={styles.inputIcon} />
          <TextInput 
            style={styles.textInput} 
            placeholder='Contraseña' 
            secureTextEntry={true} // Para ocultar la contraseña
          />
        </View>
        <View style={styles.inputContainer}>
          <Image source={require('../../../../assets/duelingo.png')} style={styles.inputIcon} />
          <TextInput 
            style={styles.textInput} 
            placeholder='Ciudad' 
          />
        </View>

        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
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
 
  },
  form: {
    width: '90%',
    maxWidth: 350,
    height: '100%',
    backgroundColor: '#ffffffff',
    position: 'absolute',
    alignSelf: 'center',
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center', 
    opacity: 0.9,


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
  registerButton: {
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',

  },
  loginContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',

  },
  loginText: {
    fontSize: 14,
    color: 'black',
  },
  loginLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    color: '#4CAF50',
    fontWeight: 'bold',

  },
});
