// Presentation/view/test/components/QuestionComponentHorizontal.tsx
import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView 
} from "react-native";
import { Question } from "../../Domain/entities/Question";

interface Props {
  question: Question;
  currentAnswer?: number;
  onAnswerSelect: (value: number) => void;
}

const QuestionComponentHorizontal: React.FC<Props> = ({ 
  question, 
  currentAnswer, 
  onAnswerSelect 
}) => {
  return (
    <View style={styles.container}>
      {/* Pregunta */}
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Pregunta {question.id}</Text>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      {/* Opciones en horizontal */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalOptions}
      >
        {question.options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.horizontalOption,
              currentAnswer === option.value && styles.horizontalOptionSelected
            ]}
            onPress={() => onAnswerSelect(option.value)}
          >
            <Text style={[
              styles.horizontalOptionValue,
              currentAnswer === option.value && styles.horizontalOptionValueSelected
            ]}>
              {option.value}
            </Text>
            <Text style={[
              styles.horizontalOptionLabel,
              currentAnswer === option.value && styles.horizontalOptionLabelSelected
            ]}>
              {option.label.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Leyenda completa debajo */}
      <View style={styles.fullLegend}>
        {question.options.map((option) => (
          <View key={option.value} style={styles.legendItem}>
            <Text style={styles.legendNumber}>{option.value}:</Text>
            <Text style={styles.legendText}>{option.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    lineHeight: 22,
  },
  horizontalOptions: {
    paddingVertical: 10,
    gap: 8,
  },
  horizontalOption: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    minWidth: 60,
    borderWidth: 2,
    borderColor: "transparent",
  },
  horizontalOptionSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#2E7D32",
  },
  horizontalOptionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  horizontalOptionValueSelected: {
    color: "white",
  },
  horizontalOptionLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  horizontalOptionLabelSelected: {
    color: "white",
    fontWeight: "600",
  },
  fullLegend: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4CAF50",
    width: 20,
  },
  legendText: {
    fontSize: 12,
    color: "#555",
    flex: 1,
  },
});

export default QuestionComponentHorizontal;