// app/(tabs)/vacinacao.tsx

import {
    StyleSheet,
    Animated,
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuth, API_URL, API_BASE_URL } from '@/app/context/AuthContext';
import { formatDbDate } from '@/app/utils/dateFormatter';
import { ENCYCLOPEDIA_MEDI } from "@/data/encyclopediaMedi";
import { MEDICAL_DATABASE } from "@/data/databaseHealthReference";
import { BREEDS_DATABASE } from '@/data/databaseBreeds';
import BreedInfoCard from '@/app/components/BreedInfoCard';

const placeholderImage = require('@/assets/imagess/images/cachorro.png');
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HistoricoItem {
    id: string;
    nome: string;
    data_aplicacao: string | null;
    data_desconhecida: number;
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
    vacinas: HistoricoItem[];
    medicamentos: HistoricoItem[];
    foto_url?: string | null;
}

// Componentes visuais
const DetailTag = ({ icon, label }: { icon: any; label: string }) => (
    <View style={styles.tag}>
        <Ionicons name={icon} size={16} color="#58707A" style={{ marginRight: 6 }} />
        <Text style={styles.tagText}>{label}</Text>
    </View>
);

const ParallaxProfile = ({ pet }: { pet: PetDetails | null }) => {
    const scrollY = useRef(new Animated.Value(0)).current;

    const backgroundTranslateY = scrollY.interpolate({
        inputRange: [0, screenHeight],
        outputRange: [0, screenHeight * 0.3],
        extrapolate: 'clamp',
    });
    const indicatorOpacity = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const breedInfo = pet
        ? BREEDS_DATABASE.find(
            (b) => b.id.includes(pet.raca) && b.especie === pet.especie,
        )
        : null;

    const imageSource = pet?.foto_url
        ? { uri: `${API_BASE_URL}${pet.foto_url}` }
        : placeholderImage;

    const showInfoAlert = (id: string) => {
        const allHealthItems = [
            ...ENCYCLOPEDIA_MEDI.flatMap(s => [...s.vaccines, ...s.medications]),
            ...MEDICAL_DATABASE.vacinas,
            ...MEDICAL_DATABASE.medicamentos,
        ];
        const info: any = allHealthItems.find(item => item.id === id);

        if (!info) {
            Alert.alert('Informação', 'Não encontramos detalhes adicionais.');
            return;
        }
        let message = "";
        if (info.previne_trata) message += `🛡️ Protege/Trata:\n- ${info.previne_trata.join("\n- ")}\n\n`;
        if (info.esquema) message += `🗓️ Esquema:\n${info.esquema.primario}\nReforço: ${info.esquema.reforco}\n\n`;
        if (info.contraindicacoes?.length) message += `❌ Contraindicações:\n- ${info.contraindicacoes.join("\n- ")}\n\n`;
        if (info.efeitos_comuns?.length) message += `⚠️ Efeitos Comuns:\n- ${info.efeitos_comuns.join("\n- ")}\n\n`;
        if (info.descricao) message += `📋 Descrição:\n${info.descricao}\n\n`;
        if (info.aplicacao) message += `💉 Aplicação:\n${info.aplicacao}\n\n`;
        if (info.regra?.observacoes || info.observacoes) message += `ℹ️ Observação:\n${info.regra?.observacoes || info.observacoes}`;
        Alert.alert(`Detalhes sobre: ${info.nome}`, message.trim());
    };

    return (
        <View style={{ width: screenWidth, height: '100%' }}>
            <Animated.Image
                source={imageSource}
                style={[styles.backgroundImage, { transform: [{ translateY: backgroundTranslateY }] }]}
                resizeMode="cover"
            />
            {pet && (
                <Animated.View style={[styles.indicatorContainer, { opacity: indicatorOpacity }]}>
                    <Ionicons name="chevron-up-outline" size={32} color="white" />
                </Animated.View>
            )}

            <Animated.ScrollView
                style={StyleSheet.absoluteFill}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true },
                )}
            >
                {!pet ? (
                    <View style={styles.contentLoading}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                ) : (
                    <View style={styles.contentContainer}>
                        <Text style={styles.petName}>{pet.nome}</Text>

                        <View style={styles.detailsSection}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tagsContainer}>
                                <DetailTag icon="paw-outline" label={`${pet.idade_valor} ${pet.idade_unidade}`} />
                                <DetailTag icon={pet.sexo === 'M' ? 'male-outline' : 'female-outline'}
                                    label={pet.sexo === 'M' ? 'Macho' : 'Fêmea'} />
                                {pet.peso && <DetailTag icon="barbell-outline" label={`${pet.peso} kg`} />}
                                {pet.cor && <DetailTag icon="color-palette-outline" label={pet.cor} />}
                            </ScrollView>
                        </View>

                        {breedInfo && <BreedInfoCard info={breedInfo} />}

                        {/* Histórico de Vacinas */}
                        <View style={styles.vaccineCard}>
                            <Text style={styles.sectionTitle}>Histórico de Vacinas</Text>
                            {pet.vacinas.length > 0 ? (
                                pet.vacinas.map((item, index) => (
                                    <View key={`vac-${item.id}-${index}`} style={styles.vaccineItem}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#28a745' }]}>
                                            <Ionicons name="shield-checkmark-outline" size={22} color="white" />
                                        </View>
                                        <View style={styles.vaccineInfo}>
                                            <Text style={styles.vaccineTitle}>{item.nome}</Text>
                                            <Text style={styles.vaccineDescription}>
                                                Aplicada em:{' '}
                                                {item.data_desconhecida
                                                    ? 'Data desconhecida'
                                                    : formatDbDate(item.data_aplicacao)}
                                            </Text>
                                        </View>
                                        <TouchableOpacity style={styles.infoButton}
                                            onPress={() => showInfoAlert(item.id)}>
                                            <Ionicons name="information-circle-outline" size={26} color="#4890F0" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyHistoryText}>Nenhum registro de vacina encontrado.</Text>
                            )}
                        </View>

                        {/* Histórico de Medicamentos */}
                        <View style={styles.vaccineCard}>
                            <Text style={styles.sectionTitle}>Histórico de Medicamentos</Text>
                            {pet.medicamentos.length > 0 ? (
                                pet.medicamentos.map((item, index) => (
                                    <View key={`med-${item.id}-${index}`} style={styles.vaccineItem}>
                                        <View style={[styles.iconContainer, { backgroundColor: '#007bff' }]}>
                                            <Ionicons name="medkit-outline" size={22} color="white" />
                                        </View>
                                        <View style={styles.vaccineInfo}>
                                            <Text style={styles.vaccineTitle}>{item.nome}</Text>
                                            <Text style={styles.vaccineDescription}>
                                                Administrado em:{' '}
                                                {item.data_desconhecida
                                                    ? 'Data desconhecida'
                                                    : formatDbDate(item.data_aplicacao)}
                                            </Text>
                                        </View>
                                        <TouchableOpacity style={styles.infoButton}
                                            onPress={() => showInfoAlert(item.id)}>
                                            <Ionicons name="information-circle-outline" size={26} color="#4890F0" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyHistoryText}>Nenhum registro de medicamento encontrado.</Text>
                            )}
                        </View>
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
};

// Componente principal que age como a tela
export default function VacinacaoScreen() {
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { getAuthHeader } = useAuth();
    const router = useRouter();
    const [petDetails, setPetDetails] = useState<PetDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPetDetails = useCallback(async () => {
        if (!petId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/pets/${petId}`, {
                headers: getAuthHeader(),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Pet não encontrado');
            }
            // Renomeia 'nome_medicamento' para 'nome' para padronizar
            const formattedData = {
                ...data,
                medicamentos: data.medicamentos.map((m: any) => ({
                    ...m,
                    nome: m.nome_medicamento,
                })),
            };
            setPetDetails(formattedData);
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

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={{ marginTop: 10, color: '#333' }}>Carregando dados do pet...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ParallaxProfile pet={petDetails} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F6F6',
    },
    contentLoading: {
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        height: screenHeight,
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    petName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A2E35',
        marginBottom: 24,
        textAlign: 'center',
        fontFamily: 'Poppins-Bold',
    },
    contentContainer: {
        marginTop: screenHeight * 0.85,
        padding: 20,
        backgroundColor: '#F4F6F6',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: screenHeight * 0.7,
    },
    detailsSection: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A2E35',
        marginBottom: 16,
    },
    tagsContainer: {
        paddingBottom: 10,
    },
    tag: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#DDEAEA',
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagText: {
        fontSize: 14,
        color: '#58707A',
        fontFamily: 'Poppins-Regular',
    },
    vaccineCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    vaccineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    vaccineInfo: {
        flex: 1,
    },
    vaccineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A2E35',
        fontFamily: 'Poppins-SemiBold',
    },
    vaccineDescription: {
        fontSize: 13,
        color: '#58707A',
        fontFamily: 'Poppins-Regular',
    },
    emptyHistoryText: {
        marginTop: 15,
        fontSize: 16,
        color: '#7A8C99',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    infoButton: {
        padding: 5,
        marginLeft: 10,
    },
});