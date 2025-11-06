// app/components/PetCard.tsx

import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { API_BASE_URL } from '../context/AuthContext';

interface Pet {
  id_pet: string;
  nome: string;
  raca: string;
  foto_url: string | null;
  is_details_complete: boolean;
  has_vaccines: boolean;
  has_meds: boolean;
}

const placeholderImage = require('@/assets/imagess/images/cachorro.png');

const PetCard = ({ pet, onDelete }: { pet: Pet; onDelete: (petId: string) => void; }) => {
  const router = useRouter();
  const isProfileComplete = pet.is_details_complete && pet.has_vaccines && pet.has_meds;

  const imageSource = pet.foto_url 
    ? { uri: `${API_BASE_URL}${pet.foto_url}` } 
    : placeholderImage;

  const navigateToDetails = () => {
    router.push({ pathname: '/(tabs)/vacinacao', params: { petId: pet.id_pet } });
  };
  
  const handleOptionsPress = (event: any) => {
    event.stopPropagation(); 
    Alert.alert(`Opções para ${pet.nome}`, 'O que fazer?', [
      { text: 'Ver Detalhes', onPress: navigateToDetails },
      { text: 'Editar', onPress: () => router.push({ pathname: '/editarPet', params: { petId: pet.id_pet } }) },
      { text: 'Deletar', onPress: () => confirmDelete(), style: 'destructive' },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  };
  
  const confirmDelete = () => Alert.alert('Confirmar Exclusão', `Tem certeza que deseja deletar ${pet.nome}?`, [{ text: 'Sim', onPress: () => onDelete(pet.id_pet), style: 'destructive' }, { text: 'Não', style: 'cancel' }]);
  
  return (
      <TouchableOpacity style={styles.petCardContainer} activeOpacity={0.8} onPress={navigateToDetails}>
          <Image source={imageSource} style={styles.petImage} />

          <View style={styles.petInfoContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.petNameText}>{pet.nome}</Text>
                  {isProfileComplete ? (
                    <Ionicons name="checkmark-circle" size={20} color="#28a745" style={{ marginLeft: 8 }} />
                  ) : (
                    <Ionicons name="alert-circle" size={20} color="#f0ad4e" style={{ marginLeft: 8 }} />
                  )}
              </View>
              <Text style={styles.petBreedText}>{pet.raca}</Text>
          </View>
          <TouchableOpacity onPress={handleOptionsPress} style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#A9B4BC" />
          </TouchableOpacity>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  petCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#E9EEF3',
  },
  petInfoContainer: { flex: 1 },
  petNameText: { fontSize: 18, fontWeight: '600', color: '#0D294F' },
  petBreedText: { fontSize: 14, color: '#7A8C99', marginTop: 4 },
  optionsButton: { padding: 8 },
});

export default PetCard;