import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { fetchAllPhotos } from '../database/database';

export default function MapScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
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
        <Text style={styles.loadingText}>A carregar marcadores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} onRegionChangeComplete={(reg) => setRegion(reg)}>
        {photos.map((item) => {
          if (!item.latitude || !item.longitude) return null;
          
          return (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              pinColor="#007bff"
            >
              <Callout tooltip>
                <View style={styles.calloutBubble}>
                  <Text style={styles.calloutTitle}>{item.title}</Text>
                  <Text style={styles.calloutDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
                  <Image source={{ uri: item.image_uri }} style={styles.calloutImage} />
                </View>
                <View style={styles.calloutArrow} />
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
  calloutBubble: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  calloutTitle: { fontWeight: 'bold', fontSize: 13, color: '#333', textAlign: 'center' },
  calloutDate: { fontSize: 10, color: '#28a745', marginBottom: 5 },
  calloutImage: { width: 100, height: 75, borderRadius: 4, marginTop: 2, resizeMode: 'cover' },
  calloutArrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 10,
    alignSelf: 'center',
    marginTop: -1,
  },
});