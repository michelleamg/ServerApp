import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';

// Definimos el tipo para las respuestas
type AnswerValue = 1 | 2 | 3 | 4 | 5;

interface Question {
  id: number;
  text: string;
}

const questions: Question[] = [
  { id: 1, text: "Tras su muerte me costaba relacionarme con algunas personas." },
  { id: 2, text: "Tras su muerte me costaba concentrarme en mi trabajo." },
  { id: 3, text: "Tras su muerte perdí el interés en mi familia, amigos y actividades fuera de casa." },
  { id: 4, text: "Tenía la necesidad de hacer las cosas que él/ella había querido hacer." },
  { id: 5, text: "Después de su muerte estaba más irritable de lo normal." },
  { id: 6, text: "En los tres primeros meses después de su muerte me sentía incapaz de realizar mis actividades habituales." },
  { id: 7, text: "Me sentía furioso/a porque me había abandonado." },
  { id: 8, text: "Tras su muerte me costaba trabajo dormir." }
];

const answerOptions = [
  { value: 1 as AnswerValue, label: "Completamente falsa", description: "No se parece en nada a mi experiencia" },
  { value: 2 as AnswerValue, label: "Falsa en su mayor parte", description: "Casi nunca me ha pasado" },
  { value: 3 as AnswerValue, label: "Ni verdadera ni falsa", description: "No estoy seguro/a o a veces sí, a veces no" },
  { value: 4 as AnswerValue, label: "Verdadera en su mayor parte", description: "La mayoría de las veces ha sido así" },
  { value: 5 as AnswerValue, label: "Completamente verdadera", description: "Describe perfectamente mi experiencia" }
];

export default function TestFormScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});

  const handleAnswer = (questionId: number, answer: AnswerValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Avanzar a la siguiente pregunta automáticamente
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions < questions.length) {
      Alert.alert(
        "Test incompleto",
        `Has respondido ${answeredQuestions} de ${questions.length} preguntas. ¿Deseas continuar de todas formas?`,
        [
          { text: "Seguir respondiendo", style: "cancel" },
          { 
            text: "Continuar", 
            style: "default",
            onPress: () => navigateToNextPart()
          }
        ]
      );
    } else {
      navigateToNextPart();
    }
  };

  const navigateToNextPart = () => {
    // Guardar las respuestas y navegar a la siguiente parte
    console.log("Respuestas guardadas:", answers);
    // Aquí podrías guardar las respuestas en AsyncStorage o en un estado global
    // navigation.navigate("ParteDosTestScreen");
    Alert.alert("Test completado", "Has completado la primera parte del test.");
  };

  const getProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  return (
    <View style={styles.container}>
      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getProgress()}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} de {questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          {/* Pregunta actual */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNumber}>
              Pregunta {currentQuestion + 1}
            </Text>
            <Text style={styles.questionText}>
              {questions[currentQuestion].text}
            </Text>
          </View>

          {/* Instrucción */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              Selecciona la opción que mejor describa tu experiencia:
            </Text>
          </View>

          {/* Opciones de respuesta */}
          <View style={styles.answersContainer}>
            {answerOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.answerButton,
                  answers[questions[currentQuestion].id] === option.value && 
                  styles.answerButtonSelected
                ]}
                onPress={() => handleAnswer(questions[currentQuestion].id, option.value)}
              >
                <View style={styles.answerContent}>
                  <View style={styles.answerHeader}>
                    <View style={styles.answerIndicator}>
                      <View 
                        style={[
                          styles.answerCircle,
                          answers[questions[currentQuestion].id] === option.value && 
                          styles.answerCircleSelected
                        ]}
                      />
                    </View>
                    <Text style={styles.answerLabel}>
                      {option.label}
                    </Text>
                  </View>
                  <Text style={styles.answerDescription}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Navegación */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.previousButton,
                currentQuestion === 0 && styles.navButtonDisabled
              ]}
              onPress={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <Text style={[
                styles.navButtonText,
                currentQuestion === 0 && styles.navButtonTextDisabled
              ]}>
                Anterior
              </Text>
            </TouchableOpacity>

            {currentQuestion === questions.length - 1 ? (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  Finalizar
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setCurrentQuestion(prev => prev + 1)}
              >
                <Text style={styles.navButtonText}>
                  Siguiente
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Información adicional */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Recuerda: Responde según cómo te sentiste en los primeros meses tras la pérdida.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
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
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    lineHeight: 24,
  },
  instructions: {
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  answersContainer: {
    marginBottom: 30,
  },
  answerButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  answerButtonSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  answerContent: {
    flex: 1,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  answerIndicator: {
    marginRight: 12,
  },
  answerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  answerCircleSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  answerDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginLeft: 32,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  previousButton: {
    backgroundColor: "#e0e0e0",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#f5f5f5",
  },
  navButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 18,
  },
});