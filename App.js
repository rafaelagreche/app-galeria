import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { initDatabase } from './src/database/database';

// Importando as telas que criaste no passo anterior
import GalleryScreen from './src/screens/GalleryScreen';
import MapScreen from './src/screens/MapScreen';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState('gallery'); // Controla qual tela está ativa ('gallery' ou 'map')

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
      {/* Área de Conteúdo: Exibe a tela dependendo da aba selecionada */}
      <View style={styles.content}>
        {currentTab === 'gallery' ? <GalleryScreen /> : <MapScreen />}
      </View>

      {/* Barra de Navegação por Abas (Tab Bar) na parte inferior */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, currentTab === 'gallery' && styles.activeTab]} 
          onPress={() => setCurrentTab('gallery')}
        >
          <Text style={[styles.tabText, currentTab === 'gallery' && styles.activeTabText]}>
            📸 Galeria
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, currentTab === 'map' && styles.activeTab]} 
          onPress={() => setCurrentTab('map')}
        >
          <Text style={[styles.tabText, currentTab === 'map' && styles.activeTabText]}>
            🗺️ Mapa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingTop: 40, // Espaço para não cobrir a barra de status do telemóvel
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e9ecef',
    borderTopWidth: 2,
    borderTopColor: '#007bff', // Linha azul indicando a aba ativa
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});