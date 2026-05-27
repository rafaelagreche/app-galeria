import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { fetchAllPhotos } from '../database/database';

export default function MapScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
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

      if (data.length > 0 && data[0].latitude && data[0].longitude) {
        setRegion({
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando o mapa interativo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        region={region} 
        onRegionChangeComplete={(reg) => setRegion(reg)}
     
        onPress={() => setSelectedPhoto(null)}
      >
        {photos.map((item) => {
          if (!item.latitude || !item.longitude) return null;
          
          return (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              pinColor="#007bff"
              
              onPress={(e) => {
                e.stopPropagation(); 
                setSelectedPhoto(item);
              }}
            />
          );
        })}
      </MapView>

      {/* PAINEL FLUTUANTE (Garante que a foto apareça perfeitamente no Android!) */}
      {selectedPhoto && (
        <View style={styles.infoPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.textContainer}>
              <Text style={styles.panelTitle}>{selectedPhoto.title}</Text>
              <Text style={styles.panelDate}>📅 {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR')}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPhoto(null)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Exibição nativa e garantida da imagem */}
          <Image source={{ uri: selectedPhoto.image_uri }} style={styles.panelImage} />

          <View style={styles.coordsRow}>
            <Text style={styles.panelCoords}>📍 Lat: {selectedPhoto.latitude.toFixed(4)}</Text>
            <Text style={styles.panelCoords}>📍 Lon: {selectedPhoto.longitude.toFixed(4)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  
  
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  textContainer: { flex: 1, paddingRight: 10 },
  panelTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  panelDate: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  closeButton: { backgroundColor: '#f1f2f6', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { color: '#57606f', fontSize: 12, fontWeight: 'bold' },
  panelImage: { width: '100%', height: 160, borderRadius: 10, resizeMode: 'cover', backgroundColor: '#f1f2f6' },
  coordsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f2f6', paddingTop: 8 },
  panelCoords: { fontSize: 11, color: '#95a5a6', fontWeight: '600' }
});