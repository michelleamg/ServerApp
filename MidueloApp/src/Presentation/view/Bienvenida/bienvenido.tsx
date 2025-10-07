import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';

// Define your stack param list
type RootStackParamList = {
  InicioTest: undefined;

};

export default function WelcomeScreen() {
  const [userName, setUserName] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Obtener el nombre del usuario del AsyncStorage
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.nombre || "");
        }
      } catch (error) {
        console.log("Error obteniendo datos del usuario:", error);
      }
    };

    getUserInfo();
  }, []);

  const handleStartTest = () => {
    navigation.navigate("InicioTest");
  };

  return (
    <View style={styles.container}>
      {/* Fondo */}
      <Image 
        source={require("../../../../assets/duelofondo.png")}  
        style={styles.imageBackground}
      />
      
      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          {/* Logo/Imagen principal */}
          <View style={styles.imageContainer}>
            <Image 
              source={require("../../../../assets/duelingo.png")}  
              style={styles.mainImage}
            />
          </View>

          {/* Mensaje de bienvenida */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>
              ¡Bienvenido a MiDuelo! 🕊️
            </Text>
            
            <Text style={styles.welcomeSubtitle}>
              Tu acompañante en el proceso de duelo
            </Text>

            <View style={styles.divider} />

            {/* Información importante */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>
                Antes de empezar necesitamos conocerte mejor
              </Text>
              
              <Text style={styles.infoText}>
                Para ofrecerte el mejor apoyo personalizado, realizaremos una evaluación inicial mediante el:
              </Text>

              <View style={styles.testCard}>
                <Text style={styles.testTitle}>📊 Inventario de Duelo de Texas</Text>
                <Text style={styles.testDescription}>
                  Este instrumento nos ayudará a comprender tu experiencia única con el duelo y identificar las áreas donde más apoyo necesitas.
                </Text>
              </View>

              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>¿Por qué es importante?</Text>
                
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🎯</Text>
                  <Text style={styles.benefitText}>Evaluación personalizada de tu proceso</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>💭</Text>
                  <Text style={styles.benefitText}>Identificación de emociones y pensamientos</Text>
                </View>
                
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🛠️</Text>
                  <Text style={styles.benefitText}>Plan de apoyo adaptado a tus necesidades</Text>
                </View>
              </View>
            </View>

            {/* Instrucciones */}
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>📝 Lo que debes saber:</Text>
              <Text style={styles.instruction}>• Toma aproximadamente 15-20 minutos</Text>
              <Text style={styles.instruction}>• Responde con sinceridad</Text>
              <Text style={styles.instruction}>• No hay respuestas correctas o incorrectas</Text>
              <Text style={styles.instruction}>• Tus respuestas son completamente confidenciales</Text>
            </View>
          </View>

          {/* Botón de acción */}
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartTest}
          >
            <Text style={styles.startButtonText}>
              Conntinuar
            </Text>
          </TouchableOpacity>

          {/* Mensaje de apoyo */}
          <Text style={styles.supportText}>
            Estamos aquí para acompañarte en cada paso 🫂
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  mainImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  welcomeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 15,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  testCard: {
    backgroundColor: "#E8F5E8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    lineHeight: 18,
  },
  instructions: {
    backgroundColor: "#FFF3E0",
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
    marginBottom: 10,
  },
  instruction: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  supportText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});