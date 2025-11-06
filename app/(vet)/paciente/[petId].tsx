import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { useAuth, API_URL, API_BASE_URL } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// --- INTERFACES PARA OS DADOS ---
interface Prontuario {
    id: number;
    data_consulta: string;
    motivo: string;
    diagnostico: string;
    tratamento: string;
}

interface PetDetails {
    id_pet: string;
    nome: string;
    raca: string;
    especie: string;
    idade_valor: number;
    idade_unidade: string;
    sexo: 'M' | 'F';
    peso: number | null;
    cor: string | null;
    foto_url?: string | null;
    prontuario: Prontuario[];
}

// --- COMPONENTE DO CARD DE CONSULTA ---
const ConsultaCard = ({ consulta }: { consulta: Prontuario }) => {
    const { colors } = useTheme();
    const dataFormatada = new Date(consulta.data_consulta).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    return (
        <View style={[styles.consultaCard, { backgroundColor: colors.background, shadowColor: colors.text }]}>
            <View style={styles.consultaHeader}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={[styles.consultaData, { color: colors.text }]}>{dataFormatada}</Text>
            </View>
            <View style={styles.consultaBody}>
                <Text style={[styles.consultaLabel, { color: colors.subtitle }]}>Motivo:</Text>
                <Text style={[styles.consultaText, { color: colors.text }]}>{consulta.motivo || 'Não informado'}</Text>
                
                <Text style={[styles.consultaLabel, { color: colors.subtitle }]}>Diagnóstico:</Text>
                <Text style={[styles.consultaText, { color: colors.text }]}>{consulta.diagnostico || 'Não informado'}</Text>
                
                <Text style={[styles.consultaLabel, { color: colors.subtitle }]}>Tratamento:</Text>
                <Text style={[styles.consultaText, { color: colors.text }]}>{consulta.tratamento || 'Não informado'}</Text>
            </View>
        </View>
    );
}

// --- TELA PRINCIPAL ---
export default function PacienteDetailScreen() {
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { getAuthHeader } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    const [pet, setPet] = useState<PetDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPetDetails = useCallback(async () => {
        if (!petId) return;
        try {
            setIsLoading(true); 
            const response = await fetch(`${API_URL}/vet/pacientes/${petId}`, { headers: getAuthHeader() });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Pet não encontrado');
            }
            setPet(data);
        } catch (error: any) {
            Alert.alert('Erro', error.message, [{ text: 'OK', onPress: () => router.back() }]);
        } finally {
            setIsLoading(false);
        }
    }, [petId, getAuthHeader, router]);

    useFocusEffect(
      useCallback(() => {
        fetchPetDetails();
      }, [fetchPetDetails])
    );

    if (isLoading || !pet) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 10 }}>Carregando prontuário...</Text>
            </View>
        );
    }

    const imageSource = pet.foto_url
        ? { uri: `${API_BASE_URL}${pet.foto_url}` }
        : require('@/assets/imagess/images/cachorro.png');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* --- SEÇÃO DE INFORMAÇÕES DO PET --- */}
                <View style={styles.petInfoContainer}>
                    <Image source={imageSource} style={styles.petImage} />
                    <Text style={[styles.petName, { color: colors.text }]}>{pet.nome}</Text>
                    <Text style={[styles.petBreed, { color: colors.subtitle }]}>{pet.especie} - {pet.raca}</Text>
                </View>

                {/* --- SEÇÃO DO PRONTUÁRIO (LISTA DE CONSULTAS) --- */}
                <View style={styles.prontuarioContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico de Consultas</Text>
                    {pet.prontuario.length > 0 ? (
                        pet.prontuario.map((consulta) => (
                            <ConsultaCard key={consulta.id} consulta={consulta} />
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                            Nenhum registro de consulta encontrado.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* --- BOTÃO FLUTUANTE PARA ADICIONAR CONSULTA --- */}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => { /* Navegar para a tela de adicionar consulta (próximo passo) */ }}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    scrollContainer: { paddingBottom: 100 },
    petInfoContainer: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    petName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    petBreed: {
        fontSize: 16,
    },
    prontuarioContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    consultaCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    consultaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
        marginBottom: 10,
    },
    consultaData: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    consultaBody: {},
    consultaLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
    },
    consultaText: {
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
});