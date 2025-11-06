// app/editarPet.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, API_URL } from '@/app/context/AuthContext';
import { PET_DATA } from '@/data/databasePets';

const backgroundImage = require('@/assets/imagess/images/cenario-cachorro.jpg');
type SelectorDataType = { label: string; value: string };

const EditableField = ({
    label,
    value,
    onEditPress,
}: {
    label: string;
    value: string | null;
    onEditPress: () => void;
}) => (
    <View style={styles.fieldContainer}>
        <View style={styles.fieldInfo}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{value || 'Não informado'}</Text>
        </View>
        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#ccc" />
        </TouchableOpacity>
    </View>
);

export default function EditPetScreen() {
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const { petId } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [nome, setNome] = useState('');
    const [especie, setEspecie] = useState('');
    const [raca, setRaca] = useState('');
    const [idade, setIdade] = useState('');
    const [unidadeIdade, setUnidadeIdade] = useState<'meses' | 'anos'>('anos');
    const [sexo, setSexo] = useState('');
    const [peso, setPeso] = useState('');
    const [cor, setCor] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        type: 'especie' | 'raca';
        title: string;
    } | null>(null);
    const [busca, setBusca] = useState('');

    useEffect(() => {
        if (!petId) {
            Alert.alert('Erro', 'ID do pet não encontrado.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
            return;
        }
        const fetchPetData = async () => {
            try {
                const response = await fetch(`${API_URL}/pets/${petId}`, {
                    headers: getAuthHeader(),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                setNome(data.nome);
                setEspecie(data.especie);
                setRaca(data.raca);
                setIdade(data.idade_valor?.toString() || '');
                setUnidadeIdade(data.idade_unidade || 'anos');
                setSexo(data.sexo);
                setPeso(data.peso?.toString() || '');
                setCor(data.cor || '');
            } catch (error: any) {
                Alert.alert('Erro ao carregar dados', error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPetData();
    }, [petId]);

    const handleSave = async () => {
        if (!nome || !especie || !raca || !idade || !sexo) {
            Alert.alert(
                'Atenção',
                'Os campos principais (Nome, Espécie, Raça, Idade e Sexo) não podem estar vazios.',
            );
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                nome,
                especie,
                raca,
                sexo,
                cor,
                peso: peso || null,
                idade_valor: parseInt(idade, 10),
                idade_unidade: unidadeIdade,
            };
            const response = await fetch(`${API_URL}/pets/${petId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro ao salvar');
            Alert.alert('Sucesso!', 'Dados do pet atualizados.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const editNome = () =>
        Alert.prompt(
            'Editar Nome',
            'Qual o novo nome do pet?',
            (text) => setNome(text || nome),
            'plain-text',
            nome,
        );
    const editCor = () =>
        Alert.prompt(
            'Editar Cor',
            'Qual a cor principal do pet?',
            (text) => setCor(text || cor),
            'plain-text',
            cor,
        );
    const editPeso = () =>
        Alert.prompt(
            'Editar Peso (kg)',
            'Qual o novo peso?',
            (text) => setPeso(text || peso),
            'numeric',
            peso,
        );

    const editIdade = () => {
        Alert.prompt(
            'Editar Idade',
            `Qual a nova idade em ${unidadeIdade}?`,
            (text) => {
                if (text && !isNaN(parseInt(text))) setIdade(text);
            },
            'numeric',
            idade,
        );
    };

    const editUnidadeIdade = () => {
        Alert.alert('Selecionar Unidade', 'A idade é em meses ou anos?', [
            { text: 'Meses', onPress: () => setUnidadeIdade('meses') },
            { text: 'Anos', onPress: () => setUnidadeIdade('anos') },
            { text: 'Cancelar', style: 'cancel' },
        ]);
    };

    const editSexo = () => {
        Alert.alert('Selecionar Sexo', '', [
            { text: 'Macho', onPress: () => setSexo('M') },
            { text: 'Fêmea', onPress: () => setSexo('F') },
            { text: 'Cancelar', style: 'cancel' },
        ]);
    };

    const openModal = (type: 'especie' | 'raca') => {
        const titles = { especie: 'Selecione a Espécie', raca: 'Selecione a Raça' };
        if (type === 'raca' && !especie) {
            Alert.alert('Atenção', 'Selecione uma espécie primeiro.');
            return;
        }
        setBusca('');
        setModalConfig({ type, title: titles[type] });
        setModalVisible(true);
    };

    const handleSingleSelect = (item: { value: string }) => {
        if (modalConfig?.type === 'especie') {
            if (especie !== item.value) setRaca('');
            setEspecie(item.value);
        } else if (modalConfig?.type === 'raca') {
            setRaca(item.value);
        }
        setModalVisible(false);
    };

    const especiesDisponiveis = useMemo(
        () => PET_DATA.map((s) => ({ label: s.label, value: s.value })),
        [],
    );
    const racasFiltradas = useMemo(() => {
        if (!especie) return [];
        const data = PET_DATA.find((s) => s.value === especie);
        return data
            ? data.breeds.filter((b) =>
                b.label.toLowerCase().includes(busca.toLowerCase()),
            )
            : [];
    }, [especie, busca]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1565C0" />
            </View>
        );
    }

    return (
        <ImageBackground
            source={backgroundImage}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Editar Dados de {nome}</Text>

                    <EditableField label="Nome" value={nome} onEditPress={editNome} />
                    <EditableField
                        label="Espécie"
                        value={especiesDisponiveis.find((e) => e.value === especie)?.label}
                        onEditPress={() => openModal('especie')}
                    />
                    <EditableField
                        label="Raça"
                        value={
                            PET_DATA.flatMap((s) => s.breeds).find((r) => r.value === raca)
                                ?.label
                        }
                        onEditPress={() => openModal('raca')}
                    />

                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldInfo}>
                            <Text style={styles.fieldLabel}>Idade</Text>
                            <Text style={styles.fieldValue}>
                                {idade} {unidadeIdade}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={editIdade} style={styles.editButton}>
                                <Ionicons name="pencil" size={20} color="#ccc" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={editUnidadeIdade}
                                style={styles.editButton}
                            >
                                <Ionicons name="swap-horizontal" size={20} color="#ccc" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <EditableField
                        label="Sexo"
                        value={sexo === 'M' ? 'Macho' : 'Fêmea'}
                        onEditPress={editSexo}
                    />
                    <EditableField
                        label="Peso (kg)"
                        value={peso}
                        onEditPress={editPeso}
                    />
                    <EditableField
                        label="Cor Principal"
                        value={cor}
                        onEditPress={editCor}
                    />

                    <View style={styles.botoesContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.actionButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.actionButtonText}>Salvar Alterações</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalConfig?.title}</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Pesquisar..."
                            placeholderTextColor="#999"
                            value={busca}
                            onChangeText={setBusca}
                        />
                        <FlatList
                            data={
                                modalConfig?.type === 'especie'
                                    ? especiesDisponiveis
                                    : racasFiltradas
                            }
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => handleSingleSelect(item as any)}
                                >
                                    <Text style={styles.modalItemText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    container: { flex: 1, paddingTop: 40 },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 30,
        textAlign: 'center',
    },
    fieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    fieldInfo: {
        flex: 1,
    },
    fieldLabel: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 4,
    },
    fieldValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    editButton: {
        padding: 8,
        marginLeft: 8,
    },
    botoesContainer: {
        flexDirection: 'row',
        marginTop: 40,
        gap: 15,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#28a745',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#6c757d',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#2c2c2c',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        color: '#fff',
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#555',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    modalItemText: { color: '#fff', fontSize: 18, textAlign: 'center' },
    modalCloseButton: {
        backgroundColor: '#1565C0',
        borderRadius: 25,
        padding: 15,
        marginTop: 20,
        alignItems: 'center',
    },
    modalCloseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
