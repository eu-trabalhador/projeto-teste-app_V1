import React, { useEffect } from 'react';
import { Router } from './src/routes/index';
import { AuthProvider } from './src/context/Auth';
import app from '@react-native-firebase/app';
import { firebaseConfig } from './src/config/firebaseConfig'; // Configuração do Firebase
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';

export default function App() {
  useEffect(() => {
    if (app.apps.length === 0) {
      app.initializeApp(firebaseConfig)
        .then(() => {
          console.log("Firebase inicializado com sucesso.");
        })
        .catch((error) => {
          console.error("Erro ao inicializar o Firebase:", error);
        });
    }
  }, []);
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar
        translucent={true} // Faz com que a barra de status fique sobre o conteúdo
        backgroundColor="transparent" // Faz a barra de status ficar transparente
        barStyle="light-content" // Cor dos ícones da barra de status
        // barStyle="dark-content" // Cor dos ícones da barra de status
      />
      <AuthProvider>
        <AuthProvider>
          <Router/>
        </AuthProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#ffffff',
  },
});