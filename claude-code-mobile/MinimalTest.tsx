import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MinimalTest() {
  const [screen, setScreen] = useState('A');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Screen: {screen}</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          console.log('BUTTON PRESSED - CHANGING TO B');
          setScreen('B');
        }}
      >
        <Text style={styles.buttonText}>Go to Screen B</Text>
      </TouchableOpacity>
      
      {screen === 'A' && <Text style={styles.content}>This is Screen A</Text>}
      {screen === 'B' && <Text style={styles.content}>This is Screen B</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 50, backgroundColor: '#000' },
  title: { fontSize: 24, color: '#fff', marginBottom: 20 },
  button: { backgroundColor: '#4ecdc4', padding: 20, borderRadius: 8, marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
  content: { fontSize: 16, color: '#fff' },
});
