import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { insertPhoto, fetchAllPhotos, deletePhoto } from '../database/database';

export default function GalleryScreen() {
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para carregar as fotos salvas no SQLite (Requisito Obrigatório)
  const loadPhotos = async () => {
    try {
      const data = await fetchAllPhotos();
      setPhotos(data);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

  // Carrega as fotos assim que a tela abre
  useEffect(() => {
    loadPhotos();
  }, []);

  const handleAddImage = async () => {
    if (!title.trim()) {
      Alert.alert("Aviso", "Por favor, digite um título antes de tirar a foto.");
      return;
    }

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !libraryPermission.granted) {
      Alert.alert("Permissão Negada", "Precisamos de acesso à câmera e galeria para funcionar.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const selectedImageUri = result.assets[0].uri;

      setLoading(true);
      try {
        const locationPermission = await Location.requestForegroundPermissionsAsync();
        
        if (!locationPermission.granted) {
          Alert.alert("Permissão Negada", "GPS recusado. Não é possível georreferenciar.");
          setLoading(false);
          return;
        }

        const currentUserLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        const { latitude, longitude } = currentUserLocation.coords;

        // Grava no SQLite
        await insertPhoto(title, selectedImageUri, latitude, longitude);
        
        Alert.alert("Sucesso!", "Imagem e localização salvas!");
        setTitle('');
        
        // Recarrega a lista de fotos na tela imediatamente
        loadPhotos();

      } catch (error) {
        Alert.alert("Erro", "Ocorreu um erro ao salvar os dados.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Função para apagar uma foto (Requisito Obrigatório)
  const handleDelete = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar esta foto do banco de dados?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar", 
          style: "destructive",
          onPress: async () => {
            await deletePhoto(id);
            loadPhotos(); // Atualiza a lista na tela
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📸 Nova Captura</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Digite o título da imagem..."
        value={title}
        onChangeText={setTitle}
      />

      <Button 
        title={loading ? "Obtendo Localização GPS..." : "Tirar Foto e Registrar Local"} 
        onPress={handleAddImage} 
        disabled={loading}
        color="#007bff" 
      />

      <Text style={styles.sectionTitle}>📋 Minhas Fotos Salvas ({photos.length})</Text>

      {/* Grid de Fotos Salvas */}
      <View style={styles.grid}>
        {photos.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.image_uri }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCoords}>Lat: {item.latitude?.toFixed(4)}</Text>
              <Text style={styles.cardCoords}>Lon: {item.longitude?.toFixed(4)}</Text>
              
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { width: '100%', height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, marginBottom: 20, fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 30, marginBottom: 15, alignSelf: 'flex-start', color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  card: { width: (windowWidth - 50) / 2, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
  cardImage: { width: '100%', height: 120, resizeMode: 'cover' },
  cardContent: { padding: 8 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardCoords: { fontSize: 11, color: '#666' },
  deleteButton: { marginTop: 8, backgroundColor: '#dc3545', paddingVertical: 4, borderRadius: 4, alignItems: 'center' },
  deleteButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});