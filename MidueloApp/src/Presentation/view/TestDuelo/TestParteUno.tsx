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

export default function ParteUnoTestScreen() {
  const [userName, setUserName] = useState("");

  const navigation = useNavigation<StackNavigationProp<any>>();
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
    console
    navigation.navigate("ParteUno");
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
                <Text style={styles.testTitle}>📊 Inventario de Duelo de Texas (ITRD-16)</Text>
                <Text style={styles.testDescription}>
                  Este instrumento nos ayudará a comprender tu experiencia única con el duelo y identificar las áreas donde más apoyo necesitas.
                </Text>
              </View>

              {/* INFORMACIÓN TÉCNICA REDUCIDA */}
              <View style={styles.technicalInfo}>
                <Text style={styles.technicalTitle}>📋 Sobre el Inventario:</Text>
                
                <View style={styles.techItem}>
                  <Text style={styles.techIcon}>•</Text>
                  <Text style={styles.techText}>
                    <Text style={styles.bold}>21 ítems</Text> en escala de 1-5 puntos
                  </Text>
                </View>
                
                <View style={styles.techItem}>
                  <Text style={styles.techIcon}>•</Text>
                  <Text style={styles.techText}>
                    <Text style={styles.bold}>2 partes:</Text> Comportamiento inicial (8 preguntas) y sentimientos actuales (13 preguntas)
                  </Text>
                </View>
                
                <View style={styles.techItem}>
                  <Text style={styles.techIcon}>•</Text>
                  <Text style={styles.techText}>
                    <Text style={styles.bold}>Duración:</Text> Aproximadamente 10 minutos
                  </Text>
                </View>

                <View style={styles.interpretation}>
                  <Text style={styles.interpretationTitle}>📈 Interpretación:</Text>
                  
                  <View style={styles.interpretationItem}>
                    <Text style={styles.interpretationIcon}>🟢</Text>
                    <Text style={styles.interpretationText}>
                      <Text style={styles.bold}>Duelo resuelto:</Text> Alta puntuación inicial, baja actual
                    </Text>
                  </View>
                  
                  <View style={styles.interpretationItem}>
                    <Text style={styles.interpretationIcon}>🟡</Text>
                    <Text style={styles.interpretationText}>
                      <Text style={styles.bold}>Duelo prolongado:</Text> Alta puntuación en ambas partes
                    </Text>
                  </View>
                  
                  <View style={styles.interpretationItem}>
                    <Text style={styles.interpretationIcon}>🔵</Text>
                    <Text style={styles.interpretationText}>
                      <Text style={styles.bold}>Duelo retardado:</Text> Baja puntuación inicial, alta actual
                    </Text>
                  </View>
                  
                  <View style={styles.interpretationItem}>
                    <Text style={styles.interpretationIcon}>⚪</Text>
                    <Text style={styles.interpretationText}>
                      <Text style={styles.bold}>Duelo ausente:</Text> Baja puntuación en ambas partes
                    </Text>
                  </View>
                </View>
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
              <Text style={styles.instruction}>• Toma aproximadamente 10-15 minutos</Text>
              <Text style={styles.instruction}>• Responde con sinceridad</Text>
              <Text style={styles.instruction}>• No hay respuestas correctas o incorrectas</Text>
              <Text style={styles.instruction}>• Tus respuestas son completamente confidenciales</Text>
              <Text style={styles.instruction}>• Sitúate mentalmente en la época del fallecimiento</Text>
            </View>
          </View>

          {/* Botón de acción */}
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartTest}
          >
            <Text style={styles.startButtonText}>
              Comenzar
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
  // NUEVOS ESTILOS PARA INFORMACIÓN TÉCNICA
  technicalInfo: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#6C757D",
  },
  technicalTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 12,
  },
  techItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  techIcon: {
    fontSize: 14,
    color: "#6C757D",
    marginRight: 8,
    marginTop: 1,
  },
  techText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    flex: 1,
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
  interpretation: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6",
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 10,
  },
  interpretationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  interpretationIcon: {
    fontSize: 12,
    marginRight: 8,
    marginTop: 2,
  },
  interpretationText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 16,
    flex: 1,
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