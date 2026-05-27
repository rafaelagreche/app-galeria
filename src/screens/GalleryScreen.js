import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image, ScrollView, TextInput, TouchableOpacity, Dimensions, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite'; 
import { insertPhoto, fetchAllPhotos, deletePhoto } from '../database/database';

export default function GalleryScreen() {
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para o Modal de Edição (Funciona perfeitamente em Android e iOS)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const loadPhotos = async () => {
    try {
      const data = await fetchAllPhotos();
      setPhotos(data);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

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
          Alert.alert("Permissão Negada", "GPS recusado.");
          setLoading(false);
          return;
        }

        const currentUserLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        const { latitude, longitude } = currentUserLocation.coords;
        await insertPhoto(title, selectedImageUri, latitude, longitude);
        
        Alert.alert("Sucesso!", "Imagem salva com localização!");
        setTitle('');
        loadPhotos();
      } catch (error) {
        Alert.alert("Erro", "Erro ao salvar no banco.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Abre a janelinha (Modal) configurando os dados da foto selecionada
  const openEditModal = (id, currentTitle) => {
    setEditingPhotoId(id);
    setNewTitle(currentTitle || '');
    setIsEditModalVisible(true);
  };

  // Salva o novo título digitado no banco de dados SQLite
  const saveNewTitle = async () => {
    if (!newTitle || !newTitle.trim()) {
      Alert.alert("Erro", "O título não pode ser vazio.");
      return;
    }
    try {
      const db = await SQLite.openDatabaseAsync('gallery.db');
      await db.runAsync(`UPDATE photos SET title = ? WHERE id = ?;`, [newTitle, editingPhotoId]);
      
      setIsEditModalVisible(false); // Fecha o modal
      loadPhotos(); // Atualiza a lista na tela
      Alert.alert("Sucesso!", "Título updated com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o título.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja apagar permanentemente esta foto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: async () => { await deletePhoto(id); loadPhotos(); } }
      ]
    );
  };

  const filteredPhotos = photos.filter(photo => 
    photo.title && photo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}> GeoGallery</Text>
        
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Qual o título do momento?..."
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TouchableOpacity 
            style={[styles.captureButton, loading && { backgroundColor: '#bdc3c7' }]} 
            onPress={handleAddImage}
            disabled={loading}
          >
            <Text style={styles.captureButtonText}>
              {loading ? "Capturando GPS..." : "Tirar Foto e Registrar Local"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Suas Fotos e Suas Localizações</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar foto por título..."
          placeholderTextColor="#7f8c8d"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.grid}>
          {filteredPhotos.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image_uri }} style={styles.cardImage} />
              
              {/* CONTEÚDO DO CARD CORRIGIDO SEM DUPLICAÇÃO */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardDate}>📅 {new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
                
                {/* Exibição das coordenadas formatadas */}
                <Text style={styles.cardLocation}> Lat: {item.latitude ? item.latitude.toFixed(4) : '0.0000'}</Text>
                <Text style={styles.cardLocation}> Lon: {item.longitude ? item.longitude.toFixed(4) : '0.0000'}</Text>
                
                {/* BOTÃO EDITAR TITULO */}
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item.id, item.title)}>
                  <Text style={styles.editButtonText}>Editar Título</Text>
                </TouchableOpacity>

                {/* BOTÃO EXCLUIR */}
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>

            </View>
          ))}
        </View>
      </ScrollView>

      {/* COMPONENTE DE JANELA MODAL (BUGFIX DO ANDROID) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Título da Foto</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Digite o novo nome..."
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#7f8c8d' }]} 
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#007bff' }]} 
                onPress={saveNewTitle}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#f4f6f9', paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#1e272e', marginTop: 30 },
  inputCard: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 25 },
  input: { width: '100%', height: 45, borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, fontSize: 15, backgroundColor: '#f8fafc' },
  captureButton: { backgroundColor: '#2e66af', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  captureButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 15, alignSelf: 'flex-start', color: '#2c3e50' },
  searchInput: { width: '100%', height: 42, borderColor: '#cbd5e1', borderWidth: 1, borderRadius: 25, paddingHorizontal: 15, marginBottom: 20, backgroundColor: '#fff', fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  card: { width: (windowWidth - 55) / 2, backgroundColor: '#fff', borderRadius: 12, marginBottom: 18, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardImage: { width: '100%', height: 130, resizeMode: 'cover' },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50', marginBottom: 2 },
  cardDate: { fontSize: 11, color: '#27ae60', fontWeight: 'bold', marginBottom: 4 },
  
  // ESTILO DA GEOLOCALIZAÇÃO ADICIONADO
  cardLocation: { fontSize: 11, color: '#7f8c8d', fontWeight: '500', marginBottom: 2 },
  
  editButton: { 
    backgroundColor: '#f1f2f6', 
    paddingVertical: 8, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 6, 
    borderWidth: 1, 
    borderColor: '#ced4da',
    width: '100%'
  },
  editButtonText: { 
    color: '#2f3542', 
    fontSize: 11, 
    fontWeight: '600' 
  },
  
  deleteButton: { 
    backgroundColor: '#ff4757', 
    paddingVertical: 8, 
    borderRadius: 6, 
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  deleteButtonText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: 'bold' 
  },

  // Estilos do Modal de Edição
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },
  modalInput: { width: '100%', height: 45, borderColor: '#cbd5e1', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 15, marginBottom: 20, backgroundColor: '#f8fafc' },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  modalButton: { flex: 1, height: 42, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  modalButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});