import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { fetchAllPhotos } from '../database/database';

export default function MapScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Região inicial padrão (caso não haja fotos, centraliza com um zoom amplo)
  const [region, setRegion] = useState({
    latitude: -15.7801,
    longitude: -47.9292,
    latitudeDelta: 15,
    longitudeDelta: 15,
  });

  const loadMapData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPhotos();
      setPhotos(data);

      // Se houver fotos salvas, foca o mapa na localização da foto mais recente
      if (data.length > 0 && data[0].latitude && data[0].longitude) {
        setRegion({
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          latitudeDelta: 0.05, // Define o nível de zoom aproximado do local
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do mapa:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega os marcadores sempre que o componente é montado
  useEffect(() => {
    loadMapData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>A carregar marcadores no mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        region={region}
        onRegionChangeComplete={(reg) => setRegion(reg)} // Permite que você mova o mapa livremente com o dedo
      >
        {/* Renderiza um marcador para cada foto que tem coordenada válida */}
        {photos.map((item) => {
          if (!item.latitude || !item.longitude) return null;
          
          return (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              pinColor="#007bff" // Pin azul combinando com o tema do app
            >
              {/* Balãozinho que aparece ao clicar no alfinete (Requisito Obrigatório do Professor) */}
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{item.title}</Text>
                  <Text style={styles.calloutSubtitle}>ID: #{item.id}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  calloutContainer: { padding: 5, minWidth: 100, alignItems: 'center' },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  calloutSubtitle: { fontSize: 11, color: '#666', marginTop: 2 }
});