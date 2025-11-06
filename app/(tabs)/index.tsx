// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '@/app/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Buffer } from 'buffer';
import { useTheme } from '@/app/context/ThemeContext';

import PetCard from '../components/PetCard';
import PetCardSkeleton from '../components/PetCardSkeleton';

interface Pet {
  id_pet: string;
  nome: string;
  raca: string;
  foto_url: string | null;
  is_details_complete: boolean;
  has_vaccines: boolean;
  has_meds: boolean;
}

interface DecodedToken { id: number; nome: string; email: string; }

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Payload = token.split('.')[1];
    const jsonPayload = Buffer.from(base64Payload, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
};

export default function PetListScreen() {
  const { session, getAuthHeader } = useAuth();
  const router = useRouter();
  const { theme } = useTheme(); 
  const isDark = theme === "dark";

  const [tutorName, setTutorName] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (session) {
      const decodedToken = decodeToken(session);
      if (decodedToken) setTutorName(decodedToken.nome);
    }
  }, [session]);

  const fetchPets = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(`${API_URL}/pets`, { headers: getAuthHeader() });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Erro ao carregar pets');

      const formattedPets = data.map((p: any) => ({
        ...p,
        is_details_complete: p.is_details_complete === 1,
        has_vaccines: p.has_vaccines > 0,
        has_meds: p.has_meds > 0,
      }));
      setPets(formattedPets);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  }, [session, getAuthHeader]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      setTimeout(() => {
        fetchPets().finally(() => setIsLoading(false));
      }, 300);
    }, [fetchPets])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPets().finally(() => setIsRefreshing(false));
  }, [fetchPets]);

  const handleDeletePet = async (petId: string) => {
    try {
      const response = await fetch(`${API_URL}/pets/${petId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'Não foi possível deletar o pet.'); }
      setPets(currentPets => currentPets.filter(p => p.id_pet !== petId));
      Alert.alert('Sucesso!', 'Pet deletado com sucesso.');
    } catch (err: any) {
      Alert.alert('Erro ao Deletar', err.message);
    }
  };

  if (isLoading && pets.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
        <Text style={[styles.headerText, { color: isDark ? "#FFFFFF" : "#0D294F" }]}>Olá, {tutorName}!</Text>
        <View style={styles.listContentContainer}>
          <PetCardSkeleton />
          <PetCardSkeleton />
          <PetCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id_pet.toString()}
        renderItem={({ item }) => <PetCard pet={item} onDelete={handleDeletePet} />}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={isDark ? "#FFFFFF" : "#4890F0"} />}
        ListHeaderComponent={<Text style={[styles.headerText, { color: isDark ? "#FFFFFF" : "#0D294F" }]}>Olá, {tutorName}!</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image source={require('@/assets/imagess/images/cachorro.png')} style={styles.emptyImage} />
            <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0D294F" }]}>Nenhum pet por aqui</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? "#AAAAAA" : "#7A8C99" }]}>Vamos registrar o seu primeiro amigo?</Text>
            <TouchableOpacity style={[styles.emptyButton, { backgroundColor: isDark ? "#333333" : "#4890F0" }]} onPress={() => router.push('/cadastrarPet')}>
              <Text style={styles.emptyButtonText}>Registrar primeiro pet</Text>
            </TouchableOpacity>
          </View>
        }
      />
      {pets.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/cadastrarPet')}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  headerText: { fontSize: 32, fontWeight: '700', marginBottom: 24 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: '#4890F0',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 20,
  },
  emptyImage: { width: 180, height: 180, resizeMode: 'contain' },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 24 },
  emptySubtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 100,
    marginTop: 24,
  },
  emptyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
