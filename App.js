import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { initDatabase } from './src/database/database';

// Importando as telas corretamente
import GalleryScreen from './src/screens/GalleryScreen';
import MapScreen from './src/screens/MapScreen';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState('gallery'); // Controla a tela ativa ('gallery' ou 'map')

  useEffect(() => {
    // Inicializa o banco de dados SQLite assim que o app abre
    initDatabase()
      .then(() => setDbInitialized(true))
      .catch((err) => console.error("Falha ao iniciar o banco: ", err));
  }, []);

  // Tela de carregamento caso o banco demore a iniciar
  if (!dbInitialized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>A configurar banco de dados SQLite...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Conteúdo da Tela Ativa */}
      <View style={styles.content}>
        {currentTab === 'gallery' ? <GalleryScreen /> : <MapScreen />}
      </View>

      {/* Barra de Navegação Inferior (Abas) */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'gallery' && styles.activeTabItem]} 
          onPress={() => setCurrentTab('gallery')}
        >
          <Text style={[styles.tabText, currentTab === 'gallery' && styles.activeTabText]}> Galeria</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, currentTab === 'map' && styles.activeTabItem]} 
          onPress={() => setCurrentTab('map')}
        >
          <Text style={[styles.tabText, currentTab === 'map' && styles.activeTabText]}> Mapa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#0026a3',
    backgroundColor: '#35699e'
  },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  activeTabItem: { backgroundColor: '#e9ecef' },
  tabText: { fontSize: 16, color: '#bbb6b6', fontWeight: '500' },
  activeTabText: { color: '#014a99', fontWeight: 'bold' }
});