// app/(vet)/dashboard.tsx

import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth, API_URL, API_BASE_URL } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Paciente {
    id_pet: string;
    nome: string;
    raca: string;
    foto_url: string | null;
    nome_tutor: string;
}

const PacienteCard = ({ paciente }: { paciente: Paciente }) => {
    const router = useRouter();
    const { colors } = useTheme();
    const imageSource = paciente.foto_url
        ? { uri: `${API_BASE_URL}${paciente.foto_url}` }
        : require('@/assets/imagess/images/cachorro.png');

    return (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.background, shadowColor: colors.text }]}
            // MUDANÇA 2: Usar o formato de objeto para a navegação, que é 100% seguro com TypeScript
            onPress={() => router.push({
                pathname: '/(vet)/paciente/[petId]',
                params: { petId: paciente.id_pet }
            })}
        >
            <Image source={imageSource} style={styles.petImage} />
            <View style={styles.cardInfo}>
                <Text style={[styles.petName, { color: colors.text }]}>{paciente.nome}</Text>
                <Text style={[styles.tutorName, { color: colors.subtitle }]}>Tutor: {paciente.nome_tutor}</Text>
                <Text style={[styles.petBreed, { color: colors.subtitle }]}>{paciente.raca}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.subtitle} />
        </TouchableOpacity>
    );
};


export default function VetDashboardScreen() {
    const { user, getAuthHeader } = useAuth();
    const { colors } = useTheme();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchPacientes = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/vet/pacientes`, { headers: getAuthHeader() });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao carregar pacientes.');
            }
            setPacientes(data);
        } catch (e: any) {
            Alert.alert('Erro', e.message);
        }
    }, [getAuthHeader]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchPacientes().finally(() => setIsLoading(false));
        }, [fetchPacientes])
    );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchPacientes().finally(() => setIsRefreshing(false));
    }, [fetchPacientes]);

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 10 }}>Buscando pacientes...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={pacientes}
                keyExtractor={(item) => item.id_pet.toString()}
                renderItem={({ item }) => <PacienteCard paciente={item} />}
                contentContainerStyle={styles.listContentContainer}
                ListHeaderComponent={
                    <Text style={[styles.headerText, { color: colors.text }]}>
                        Olá, Dr(a). {user?.nome.split(' ')[0]}!
                    </Text>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="paw-outline" size={80} color={colors.subtitle} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum paciente vinculado</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.subtitle }]}>
                            Peça para o tutor do pet vincular você como veterinário no app dele.
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    listContentContainer: { paddingHorizontal: 20, paddingTop: 10 },
    headerText: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginVertical: 8,
        elevation: 2,
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    petImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
    cardInfo: { flex: 1 },
    petName: { fontSize: 18, fontWeight: 'bold' },
    tutorName: { fontSize: 14, marginTop: 4 },
    petBreed: { fontSize: 14, fontStyle: 'italic' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
    emptySubtitle: { fontSize: 16, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});