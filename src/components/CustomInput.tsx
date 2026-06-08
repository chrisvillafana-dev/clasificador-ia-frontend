import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

// Definimos el "contrato" de TypeScript para asegurar qué datos debe recibir este componente
interface CustomInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const CustomInput: React.FC<CustomInputProps> = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText 
}) => {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#adb5bd"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="sentences"
        autoCorrect={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    width: '100%',
    marginTop: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
});