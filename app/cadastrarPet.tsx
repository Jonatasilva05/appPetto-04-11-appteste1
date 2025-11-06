import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Platform, Alert, ScrollView, ActivityIndicator, Modal, FlatList, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth, API_URL } from '@/app/context/AuthContext';
import { PET_DATA } from '@/data/databasePets';
import { HEALTH_DATA, HealthItem } from '@/data/databaseMedi';
import HistoricoItemCard from '@/app/components/HistoricoItemCard';
// Importação adicionada para o seletor de data
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface HistoricoSaudeItem {
    id: string;
    name: string;
    data_aplicacao: string;
    data_desconhecida: boolean;
}

export default function CadastrarPetScreen() {
  const router = useRouter();
  const { getAuthHeader } = useAuth();
  const [etapa, setEtapa] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // --- Novos estados para o DatePicker ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  // ----------------------------------------

  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [raca, setRaca] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [naoSeiDataNascimento, setNaoSeiDataNascimento] = useState(false);
  const [idadeAprox, setIdadeAprox] = useState('');
  const [unidadeIdade, setUnidadeIdade] = useState<'anos' | 'meses'>('anos');
  const [idadeMesesExtra, setIdadeMesesExtra] = useState('');
  const [naoSeiMeses, setNaoSeiMeses] = useState(false);
  const [idadeDiasExtra, setIdadeDiasExtra] = useState('');
  const [naoSeiDias, setNaoSeiDias] = useState(false);
  const [sexo, setSexo] = useState('');
  const [peso, setPeso] = useState('');
  const [naoSeiPeso, setNaoSeiPeso] = useState(false);
  const [cor, setCor] = useState('');
  const [foiVacinado, setFoiVacinado] = useState<
    'sim' | 'nao' | 'nao_sei' | null
  >(null);
  const [historicoVacinas, setHistoricoVacinas] = useState<
    HistoricoSaudeItem[]
  >([]);
  const [estaMedicado, setEstaMedicado] = useState<
    'sim' | 'nao' | 'nao_sei' | null
  >(null);
  const [historicoMedicamentos, setHistoricoMedicamentos] = useState<
    HistoricoSaudeItem[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'especie' | 'raca' | 'vacina' | 'medicamento';
    title: string;
  } | null>(null);
  const [busca, setBusca] = useState('');

  // Logica para escolha da imagem
  const handleChooseImageSource = () => {
    Alert.alert('Adicionar Foto', 'Escolha uma opção:', [
      {
        text: 'Tirar Foto com a Câmera',
        onPress: () => selectImage('camera'),
      },
      {
        text: 'Escolher da Galeria',
        onPress: () => selectImage('gallery'),
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  // Função única e inteligente para lidar com ambas as opções
  const selectImage = async (source: 'camera' | 'gallery') => {
        let checkPermission;
        let requestPermission;
        let launchPicker;

        // 1. Define as funções corretas para câmera ou galeria
        if (source === 'camera') {
            checkPermission = ImagePicker.getCameraPermissionsAsync;
            requestPermission = ImagePicker.requestCameraPermissionsAsync;
            launchPicker = ImagePicker.launchCameraAsync;
        } else {
            checkPermission = ImagePicker.getMediaLibraryPermissionsAsync;
            requestPermission = ImagePicker.requestMediaLibraryPermissionsAsync;
            launchPicker = ImagePicker.launchImageLibraryAsync;
        }

        try {
            // 2. Verifica o status da permissão SEM pedir ainda
            const { status } = await checkPermission();
            
            let finalStatus = status;

            // 3. Se a permissão ainda não foi pedida, pede agora
            if (status !== 'granted') {
                const { status: newStatus } = await requestPermission();
                finalStatus = newStatus;
            }

            // 4. Se, após verificar e pedir, a permissão não for concedida, exibe um alerta e para
            if (finalStatus !== 'granted') {
                Alert.alert(
                    'Permissão Necessária',
                    'Você precisa conceder a permissão nas configurações do seu celular para continuar.'
                );
                return;
            }

            // 5. SOMENTE AGORA, com a permissão garantida, abre a câmera/galeria
            const result = await launchPicker({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const originalImage = result.assets[0];
                const resizedImage = await ImageManipulator.manipulateAsync(
                    originalImage.uri,
                    [{ resize: { width: 800 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                setFoto(resizedImage);
            }

        } catch (error) {
            console.error("Erro ao selecionar imagem:", error);
            Alert.alert("Erro", "Não foi possível carregar a imagem.");
        }
    };
  const etapaAnterior = () => setEtapa((prev) => prev - 1);

  // --- Função de Validação de Data ---
  const isValidDate = (dateString: string): boolean => {
    // 1. Verifica o formato DD/MM/AAAA
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return false;
    }

    // 2. Extrai as partes
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-12
    const year = parseInt(parts[2], 10);

    // 3. Verifica valores básicos
    if (year < 1900 || month < 1 || month > 12) {
      return false;
    }

    // 4. Cria a data e verifica se é válida (ex: 30/02)
    const date = new Date(year, month - 1, day); // month - 1 porque é 0-indexado
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return false;
    }
    
    // 5. (Importante para Nascimento) Verifica se a data não é no futuro
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para comparar só a data
    if (date > today) {
      return false;
    }

    return true;
  };

  // --- NOVA FUNÇÃO DE VALIDAÇÃO INSTANTÂNEA ---
  const validateDateOnBlur = () => {
    // Não valida se o checkbox "Não sei" estiver marcado ou se o campo estiver vazio
    if (naoSeiDataNascimento || !dataNascimento) {
      return;
    }
    
    // Se o campo tiver conteúdo, valida
    if (!isValidDate(dataNascimento)) {
      Alert.alert(
        'Data Inválida',
        'A data de nascimento digitada não é válida ou está no futuro. Por favor, corrija (DD/MM/AAAA).'
      );
    }
  };
  // ------------------------------------------------

  const proximaEtapa = () => {
    if (etapa === 1 && (!nome.trim() || !especie || !raca)) {
      Alert.alert('Atenção', 'Preencha Nome, Espécie e Raça para avançar.');
      return;
    }
    if (etapa === 2) {
      // --- Bloco de validação da Etapa 2 atualizado ---
      const dataDigitada = dataNascimento.trim() !== '';
      const formatoCorreto = dataNascimento.match(/^\d{2}\/\d{2}\/\d{4}$/);
      const isDataNascimentoValida = !naoSeiDataNascimento && isValidDate(dataNascimento);
      const isIdadeAproximadaValida =
        naoSeiDataNascimento && idadeAprox.trim() !== '';
      
      // Verifica se o usuário digitou algo, no formato certo, mas a data é inválida (ex: 30/02 ou data futura)
      if (!naoSeiDataNascimento && dataDigitada && formatoCorreto && !isDataNascimentoValida) {
        Alert.alert(
          'Data Inválida',
          'A data de nascimento digitada não é válida ou está no futuro. Verifique o dia, mês e ano.',
        );
        return;
      }

      // Validação principal: ou a data é válida, ou a idade aproximada é válida
      if (!isDataNascimentoValida && !isIdadeAproximadaValida) {
        Alert.alert(
          'Atenção',
          'Informe uma Data de Nascimento válida (DD/MM/AAAA) ou uma Idade Aproximada para avançar.',
        );
        return;
      }
      if (!sexo) {
        Alert.alert('Atenção', 'Informe o Sexo para avançar.');
        return;
      }
    }
    if (etapa === 3) {
      if (foiVacinado === 'sim' && historicoVacinas.length === 0) {
        Alert.alert(
          'Atenção',
          'Você selecionou "Sim", por favor, adicione pelo menos uma vacina para avançar.',
        );
        return;
      }
    }
    setEtapa((prev) => prev + 1);
  };

  const handleFinalizarCadastro = async () => {
    if (!nome || !especie || !raca) {
      Alert.alert('Erro', 'Os dados da primeira etapa são obrigatórios.', [
        { text: 'OK', onPress: () => setEtapa(1) },
      ]);
      return;
    }
    
    // --- Bloco de validação da Etapa 2 atualizado ---
    const isDataNascimentoValida = !naoSeiDataNascimento && isValidDate(dataNascimento);
    const isIdadeAproximadaValida =
      naoSeiDataNascimento && idadeAprox.trim() !== '';
    
    if ((!isDataNascimentoValida && !isIdadeAproximadaValida) || !sexo) {
      Alert.alert('Erro', 'Os dados de idade e sexo são obrigatórios. Verifique a data de nascimento ou a idade aproximada.', [
        { text: 'OK', onPress: () => setEtapa(2) },
      ]);
      return;
    }
    // --- Fim do bloco de validação ---

    if (foiVacinado === 'sim' && historicoVacinas.length === 0) {
      Alert.alert(
        'Atenção',
        'Você marcou que o pet foi vacinado, mas não adicionou nenhuma vacina.',
        [{ text: 'OK', onPress: () => setEtapa(3) }],
      );
      return;
    }
    if (estaMedicado === 'sim' && historicoMedicamentos.length === 0) {
      Alert.alert(
        'Atenção',
        'Você marcou que o pet toma medicação, mas não adicionou nenhum medicamento.',
        [{ text: 'OK', onPress: () => setEtapa(4) }],
      );
      return;
    }

    setIsLoading(true);
    const formData = new FormData();

    if (foto) {
      const uriParts = foto.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('foto', {
        uri: foto.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
    }

    formData.append('nome', nome.trim());
    formData.append('especie', especie);
    formData.append('raca', raca);
    formData.append('sexo', sexo);
    if (cor.trim()) formData.append('cor', cor.trim());
    if (!naoSeiPeso && peso.trim()) formData.append('peso', peso.trim());

    if (naoSeiDataNascimento) {
      formData.append('idade_valor', idadeAprox);
      formData.append('idade_unidade', unidadeIdade);
      if (unidadeIdade === 'anos' && !naoSeiMeses && idadeMesesExtra) {
        formData.append('idade_meses', idadeMesesExtra);
      }
      if (unidadeIdade === 'meses' && !naoSeiDias && idadeDiasExtra) {
        formData.append('idade_dias', idadeDiasExtra);
      }
    } else {
      formData.append(
        'data_nascimento',
        dataNascimento.split('/').reverse().join('-'),
      );
    }

    const vacinasParaEnviar = historicoVacinas.map((v) => {
      // Converte a data de DD/MM/AAAA para AAAA-MM-DD, que o banco de dados entende assim nao gera confito na gravação e visualização
      const dataFormatada = v.data_aplicacao
        ? v.data_aplicacao.split('/').reverse().join('-')
        : null;

      return {
        id: v.id,
        nome: v.name,
        // Envia com o nome correto da propriedade: 'data_aplicacao'
        data_aplicacao: dataFormatada,
        // Envia a informação que estava faltando: 'data_desconhecida'
        data_desconhecida: v.data_desconhecida,
      };
    });

    const medicamentosParaEnviar = historicoMedicamentos.map((m) => {
      const dataFormatada = m.data_aplicacao
        ? m.data_aplicacao.split('/').reverse().join('-')
        : null;

      return {
        id: m.id,
        nome: m.name,
        data_aplicacao: dataFormatada,
        data_desconhecida: m.data_desconhecida,
      };
    });

    if (foiVacinado === 'sim' && vacinasParaEnviar.length > 0) {
      formData.append('vacinas', JSON.stringify(vacinasParaEnviar));
    }
    if (estaMedicado === 'sim' && medicamentosParaEnviar.length > 0) {
      formData.append('medicamentos', JSON.stringify(medicamentosParaEnviar));
    }

    try {
      const response = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart-form-data' },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao cadastrar');
      Alert.alert('Sucesso!', `${nome} foi cadastrado com sucesso!`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Novas funções para o DatePicker ---
  const openDatePicker = () => {
    // Tenta converter a data digitada para o seletor
    const parts = dataNascimento.split('/');
    let currentDate = new Date();
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      if (day && month && year > 1900) {
        currentDate = new Date(year, month - 1, day); // Mês é 0-indexado
      }
    }
    setDatePickerDate(currentDate);
    setShowDatePicker(true);
  };

  const onChangeDatePicker = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Esconde o seletor
    setShowDatePicker(false);
    
    if (event.type === 'set' && selectedDate) {
      // Se o usuário selecionou uma data
      setDatePickerDate(selectedDate);
      
      // Formata a data para DD/MM/AAAA
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
      const year = selectedDate.getFullYear();
      
      setDataNascimento(`${day}/${month}/${year}`);
      
      // Se o usuário selecionou uma data, desmarca o "Não sei a data"
      setNaoSeiDataNascimento(false);
    }
  };
  // ----------------------------------------

  const handleDataNascimentoChange = useCallback(
    (text: string) => {
      let formattedText = text.replace(/[^0-9]/g, '');
      if (text.length > dataNascimento.length) {
        if (formattedText.length > 2)
          formattedText =
            formattedText.slice(0, 2) + '/' + formattedText.slice(2);
        if (formattedText.length > 5)
          formattedText =
            formattedText.slice(0, 5) + '/' + formattedText.slice(5, 9);
      } else {
        formattedText = text;
      }
      setDataNascimento(formattedText);
    },
    [dataNascimento],
  );

  const handleHistoricoDateChange = useCallback(
    (
      id: string,
      text: string,
      list: HistoricoSaudeItem[],
      setList: React.Dispatch<React.SetStateAction<HistoricoSaudeItem[]>>,
    ) => {
      setList((currentList) =>
        currentList.map((item) => {
          if (item.id === id) {
            let formattedText = text.replace(/[^0-9]/g, '');
            const currentVal = item.data_aplicacao || '';
            if (text.length > currentVal.length) {
              if (formattedText.length > 2)
                formattedText =
                  formattedText.slice(0, 2) + '/' + formattedText.slice(2);
              if (formattedText.length > 5)
                formattedText =
                  formattedText.slice(0, 5) + '/' + formattedText.slice(5, 9);
            } else {
              formattedText = text;
            }
            return { ...item, data_aplicacao: formattedText };
          }
          return item;
        }),
      );
    },
    [],
  );

  const handleHistoricoDateUnknownToggle = useCallback(
    (
      id: string,
      setList: React.Dispatch<React.SetStateAction<HistoricoSaudeItem[]>>,
    ) => {
      setList((currentList) =>
        currentList.map((item) =>
          item.id === id
            ? {
                ...item,
                data_desconhecida: !item.data_desconhecida,
                data_aplicacao: '',
              }
            : item,
        ),
      );
    },
    [],
  );

  const handleRemoveHistoricoItem = useCallback(
    (
      id: string,
      setList: React.Dispatch<React.SetStateAction<HistoricoSaudeItem[]>>,
    ) => {
      setList((currentList) => currentList.filter((item) => item.id !== id));
    },
    [],
  );

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
  const saudeData = useMemo(() => {
    if (!especie) return { vaccines: [], medications: [] };
    return (
      HEALTH_DATA.find((s) => s.species_value === especie) ||
      HEALTH_DATA.find((s) => s.species_value === 'outro')
    );
  }, [especie]);
  const vacinasFiltradas = useMemo(
    () =>
      saudeData?.vaccines.filter((v) =>
        v.name.toLowerCase().includes(busca.toLowerCase()),
      ) || [],
    [saudeData, busca],
  );
  const medicamentosFiltrados = useMemo(
    () =>
      saudeData?.medications.filter((m) =>
        m.name.toLowerCase().includes(busca.toLowerCase()),
      ) || [],
    [saudeData, busca],
  );

  const modalData = useMemo(() => {
        switch (modalConfig?.type) {
            case 'especie':
                return especiesDisponiveis;
            case 'raca':
                return racasFiltradas;
            case 'vacina':
                return vacinasFiltradas;
            case 'medicamento':
                return medicamentosFiltrados;
            default:
                return [];
        }
    }, [modalConfig, especiesDisponiveis, racasFiltradas, vacinasFiltradas, medicamentosFiltrados]);

    const isHealthItem = (item: any): item is HealthItem => {
        return 'category' in item;
    };

  const openModal = (type: 'especie' | 'raca' | 'vacina' | 'medicamento') => {
    const titles = {
      especie: 'Selecione a Espécie',
      raca: 'Selecione a Raça',
      vacina: 'Selecione as Vacinas',
      medicamento: 'Selecione os Medicamentos',
    };
    if (
      (type === 'raca' || type === 'vacina' || type === 'medicamento') &&
      !especie
    ) {
      Alert.alert('Atenção', 'Selecione uma espécie primeiro.');
      return;
    }
    setBusca('');
    setModalConfig({ type, title: titles[type] });
    setModalVisible(true);
  };
  const handleSingleSelect = (item: { value: string }) => {
    if (modalConfig?.type === 'especie') {
      if (especie !== item.value) {
        setRaca('');
        setHistoricoVacinas([]);
        setHistoricoMedicamentos([]);
      }
      setEspecie(item.value);
    } else if (modalConfig?.type === 'raca') {
      setRaca(item.value);
    }
    setModalVisible(false);
  };
  const handleMultiSelect = (
    item: HealthItem,
    list: HistoricoSaudeItem[],
    setList: Function,
  ) => {
    const jaExiste = list.find((i) => i.id === item.id);
    if (jaExiste) setList(list.filter((i) => i.id !== item.id));
    else
      setList([
        ...list,
        {
          id: item.id,
          name: item.name,
          data_aplicacao: '',
          data_desconhecida: false,
        },
      ]);
  };
  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Cadastro do Pet</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${(etapa / 4) * 100}%` }]}
            />
          </View>

          {etapa === 1 && (
            <View style={styles.content}>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handleChooseImageSource}
              >
                {foto ? (
                  <Image
                    source={{ uri: foto.uri }}
                    style={styles.petImagePreview}
                  />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera" size={40} color="#ccc" />
                    <Text style={styles.imagePickerText}>Foto do Pet</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.inputLabel}>Nome do Pet</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Bob"
                value={nome}
                onChangeText={setNome}
              />
              <Text style={styles.inputLabel}>Espécie</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openModal('especie')}
              >
                <Text style={styles.pickerButtonText}>
                  {especie
                    ? especiesDisponiveis.find((e) => e.value === especie)
                        ?.label
                    : 'Selecione...'}
                </Text>
                <Ionicons name="chevron-down" size={24} color="#ccc" />
              </TouchableOpacity>
              <Text style={styles.inputLabel}>Raça</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => openModal('raca')}
                disabled={!especie}
              >
                <Text
                  style={[
                    styles.pickerButtonText,
                    !especie && { color: '#888' },
                  ]}
                >
                  {raca
                    ? PET_DATA.flatMap((s) => s.breeds).find(
                        (r) => r.value === raca,
                      )?.label
                    : 'Selecione...'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={!especie ? '#888' : '#ccc'}
                />
              </TouchableOpacity>
            </View>
          )}

          {etapa === 2 && (
            <View style={styles.content}>
              {/* --- BLOCO DE DATA DE NASCIMENTO MODIFICADO --- */}
              <View style={styles.labelComCheckbox}>
                <Text style={styles.inputLabel}>Data de Nascimento</Text>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => {
                    setNaoSeiDataNascimento(!naoSeiDataNascimento);
                    setDataNascimento('');
                  }}
                >
                  <Ionicons
                    name={naoSeiDataNascimento ? 'checkbox' : 'square-outline'}
                    size={24}
                    color="#ccc"
                  />
                  <Text style={styles.checkboxLabel}>Não sei a data</Text>
                </TouchableOpacity>
              </View>
              
              <View style={[
                  styles.inputIconContainer,
                  naoSeiDataNascimento && styles.inputDisabled
              ]}>
                <TextInput
                  style={styles.inputComIcone}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#888"
                  value={dataNascimento}
                  onChangeText={handleDataNascimentoChange}
                  maxLength={10}
                  keyboardType="number-pad"
                  editable={!naoSeiDataNascimento}
                  // --- ADICIONADO onBlur ---
                  onBlur={validateDateOnBlur}
                  // -------------------------
                />
                <TouchableOpacity 
                  onPress={openDatePicker} 
                  disabled={naoSeiDataNascimento}
                  style={styles.calendarIcon}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={24} 
                    color={naoSeiDataNascimento ? '#555' : '#fff'} 
                  />
                </TouchableOpacity>
              </View>
              {/* --- FIM DO BLOCO MODIFICADO --- */}

              {naoSeiDataNascimento && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.inputLabel}>Idade Aproximada</Text>
                  <View style={styles.idadeContainer}>
                    <TextInput
                      style={styles.idadeInput}
                      placeholder="Ex: 5"
                      value={idadeAprox}
                      onChangeText={setIdadeAprox}
                      keyboardType="number-pad"
                    />
                    <View style={styles.unidadeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.unidadeButton,
                          unidadeIdade === 'meses' &&
                            styles.unidadeButtonSelected,
                        ]}
                        onPress={() => setUnidadeIdade('meses')}
                      >
                        <Text
                          style={[
                            styles.unidadeButtonText,
                            unidadeIdade === 'meses' &&
                              styles.unidadeButtonTextSelected,
                          ]}
                        >
                          Meses
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.unidadeButton,
                          unidadeIdade === 'anos' &&
                            styles.unidadeButtonSelected,
                        ]}
                        onPress={() => setUnidadeIdade('anos')}
                      >
                        <Text
                          style={[
                            styles.unidadeButtonText,
                            unidadeIdade === 'anos' &&
                              styles.unidadeButtonTextSelected,
                          ]}
                        >
                          Anos
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {unidadeIdade === 'anos' && (
                    <View style={{ marginTop: 10 }}>
                      <View style={styles.labelComCheckbox}>
                        <Text style={styles.inputLabelMenor}>
                          e Meses (opcional)
                        </Text>
                        <TouchableOpacity
                          style={styles.checkboxContainer}
                          onPress={() => {
                            setNaoSeiMeses(!naoSeiMeses);
                            setIdadeMesesExtra('');
                          }}
                        >
                          <Ionicons
                            name={naoSeiMeses ? 'checkbox' : 'square-outline'}
                            size={20}
                            color="#ccc"
                          />
                          <Text style={styles.checkboxLabel}>Não sei</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={[
                          styles.input,
                          naoSeiMeses && styles.inputDisabled,
                        ]}
                        placeholder="Ex: 3"
                        value={idadeMesesExtra}
                        onChangeText={setIdadeMesesExtra}
                        keyboardType="number-pad"
                        editable={!naoSeiMeses}
                      />
                    </View>
                  )}
                  {unidadeIdade === 'meses' && (
                    <View style={{ marginTop: 10 }}>
                      <View style={styles.labelComCheckbox}>
                        <Text style={styles.inputLabelMenor}>
                          e Dias (opcional)
                        </Text>
                        <TouchableOpacity
                          style={styles.checkboxContainer}
                          onPress={() => {
                            setNaoSeiDias(!naoSeiDias);
                            setIdadeDiasExtra('');
                          }}
                        >
                          <Ionicons
                            name={naoSeiDias ? 'checkbox' : 'square-outline'}
                            size={20}
                            color="#ccc"
                          />
                          <Text style={styles.checkboxLabel}>Não sei</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={[
                          styles.input,
                          naoSeiDias && styles.inputDisabled,
                        ]}
                        placeholder="Ex: 15"
                        value={idadeDiasExtra}
                        onChangeText={setIdadeDiasExtra}
                        keyboardType="number-pad"
                        editable={!naoSeiDias}
                      />
                    </View>
                  )}
                </View>
              )}
              <Text style={styles.inputLabel}>Sexo</Text>
              <View style={styles.sexoContainer}>
                <TouchableOpacity
                  style={[
                    styles.sexoButton,
                    sexo === 'M' && styles.sexoButtonSelected,
                  ]}
                  onPress={() => setSexo('M')}
                >
                  <Ionicons
                    name="male"
                    size={24}
                    color={sexo === 'M' ? '#fff' : '#1565C0'}
                  />
                  <Text
                    style={[
                      styles.sexoButtonText,
                      sexo === 'M' && styles.sexoButtonTextSelected,
                    ]}
                  >
                    Macho
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sexoButton,
                    sexo === 'F' && styles.sexoButtonSelected,
                  ]}
                  onPress={() => setSexo('F')}
                >
                  <Ionicons
                    name="female"
                    size={24}
                    color={sexo === 'F' ? '#fff' : '#e91e63'}
                  />
                  <Text
                    style={[
                      styles.sexoButtonText,
                      sexo === 'F' && styles.sexoButtonTextSelected,
                    ]}
                  >
                    Fêmea
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.labelComCheckbox}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => {
                    setNaoSeiPeso(!naoSeiPeso);
                    setPeso('');
                  }}
                >
                  <Ionicons
                    name={naoSeiPeso ? 'checkbox' : 'square-outline'}
                    size={24}
                    color="#ccc"
                  />
                  <Text style={styles.checkboxLabel}>Não sei</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, naoSeiPeso && styles.inputDisabled]}
                placeholder="Opcional. Ex: 12.5"
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
                editable={!naoSeiPeso}
              />
              <Text style={styles.inputLabel}>Cor Principal</Text>
              <TextInput
                style={styles.input}
                placeholder="Opcional. Ex: Dourado"
                value={cor}
                onChangeText={setCor}
              />
            </View>
          )}

          {etapa === 3 && (
            <View style={styles.optionalSection}>
              <Text style={styles.inputLabel}>O pet já foi vacinado?</Text>
              <View style={styles.yesNoContainer}>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    foiVacinado === 'sim' && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setFoiVacinado('sim')}
                >
                  <Text style={styles.yesNoButtonText}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    foiVacinado === 'nao' && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setFoiVacinado('nao')}
                >
                  <Text style={styles.yesNoButtonText}>Não</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    foiVacinado === 'nao_sei' && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setFoiVacinado('nao_sei')}
                >
                  <Text style={styles.yesNoButtonText}>Não Sei</Text>
                </TouchableOpacity>
              </View>
              {foiVacinado === 'sim' && (
                <View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => openModal('vacina')}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.addButtonLabel}>
                      Selecionar Vacinas
                    </Text>
                  </TouchableOpacity>
                  {historicoVacinas.map((item) => (
                    <HistoricoItemCard
                      key={item.id}
                      item={item}
                      onDateChange={(text) =>
                        handleHistoricoDateChange(
                          item.id,
                          text,
                          historicoVacinas,
                          setHistoricoVacinas,
                        )
                      }
                      onDateUnknownToggle={() =>
                        handleHistoricoDateUnknownToggle(
                          item.id,
                          setHistoricoVacinas,
                        )
                      }
                      onRemove={() =>
                        handleRemoveHistoricoItem(item.id, setHistoricoVacinas)
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          )}
          {etapa === 4 && (
            <View style={styles.optionalSection}>
              <Text style={styles.inputLabel}>
                O pet já tomou ou ainda toma alguma medicação?
              </Text>
              <View style={styles.yesNoContainer}>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    estaMedicado === 'sim' && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setEstaMedicado('sim')}
                >
                  <Text style={styles.yesNoButtonText}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    estaMedicado === 'nao' && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setEstaMedicado('nao')}
                >
                  <Text style={styles.yesNoButtonText}>Não</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.yesNoButton,
                    estaMedicado === 'nao_sei' && styles.yesNoButtonSelected,
                  ]}
                  onPress={() => setEstaMedicado('nao_sei')}
                >
                  <Text style={styles.yesNoButtonText}>Não Sei</Text>
                </TouchableOpacity>
              </View>
              {estaMedicado === 'sim' && (
                <View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => openModal('medicamento')}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.addButtonLabel}>
                      Selecionar Medicamentos
                    </Text>
                  </TouchableOpacity>
                  {historicoMedicamentos.map((item) => (
                    <HistoricoItemCard
                      key={item.id}
                      item={item}
                      onDateChange={(text) =>
                        handleHistoricoDateChange(
                          item.id,
                          text,
                          historicoMedicamentos,
                          setHistoricoMedicamentos,
                        )
                      }
                      onDateUnknownToggle={() =>
                        handleHistoricoDateUnknownToggle(
                          item.id,
                          setHistoricoMedicamentos,
                        )
                      }
                      onRemove={() =>
                        handleRemoveHistoricoItem(
                          item.id,
                          setHistoricoMedicamentos,
                        )
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.botoesContainer}>
            {etapa > 1 && (
              <TouchableOpacity
                style={[styles.button, styles.buttonVoltar]}
                onPress={etapaAnterior}
              >
                <Text style={styles.buttonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            {etapa < 4 && (
              <TouchableOpacity
                style={[styles.button, styles.buttonAvancar]}
                onPress={proximaEtapa}
              >
                <Text style={styles.buttonText}>Avançar</Text>
              </TouchableOpacity>
            )}
            {etapa === 4 && (
              <TouchableOpacity
                style={[styles.button, styles.buttonFinalizar]}
                onPress={handleFinalizarCadastro}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Finalizar Cadastro</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- Componente DatePicker Adicionado --- */}
      {showDatePicker && (
        <RNDateTimePicker
          value={datePickerDate}
          mode="date"
          display="default"
          onChange={onChangeDatePicker}
          maximumDate={new Date()}
        />
      )}
      {/* ----------------------------------------- */}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{modalConfig?.title}</Text>
                        <TextInput style={styles.searchInput} placeholder="Pesquisar..." value={busca} onChangeText={setBusca} />
                      
                        <FlatList 
                            data={modalData as any[]} 
                            keyExtractor={(item) => (item as any).id || (item as any).value} 
                            renderItem={({ item }) => {
                                const isSelected = isHealthItem(item) && (
                                    modalConfig?.type === 'vacina' 
                                        ? historicoVacinas.some(v => v.id === item.id)
                                        : historicoMedicamentos.some(m => m.id === item.id)
                                );

                                return (
                                    <TouchableOpacity 
                                        style={styles.modalItem} 
                                        onPress={() => {
                                            if (isHealthItem(item)) { // <-- Usando isHealthItem
                                                if (modalConfig?.type === 'vacina') {
                                                    handleMultiSelect(item, historicoVacinas, setHistoricoVacinas);
                                                } else if (modalConfig?.type === 'medicamento') {
                                                    handleMultiSelect(item, historicoMedicamentos, setHistoricoMedicamentos);
                                                }
                                            } else {
                                                handleSingleSelect(item as { value: string });
                                            }
                                        }}
                                    >
                                        <Text style={styles.modalItemText}>{(item as any).label || (item as any).name}</Text>
                                        {isHealthItem(item) && ( // <-- Usando isHealthItem
                                            <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={24} color={isSelected ? '#28a745' : '#ccc'} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }} 
                            ListEmptyComponent={<Text style={styles.modalItemText}>Nenhum item encontrado.</Text>} 
                        />
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: { padding: 5 },
  cancelButtonText: { color: '#ff4d4d', fontSize: 16, fontWeight: 'bold' },
  title: {
    color: 'dodgerblue',
    fontWeight: '700',
    fontSize: 24,
    textAlign: 'center',
    flex: 1,
    marginRight: 70,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 95,
    left: 20,
    right: 20,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'dodgerblue',
    borderRadius: 4,
  },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  imagePicker: { alignItems: 'center', marginBottom: 20 },
  petImagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'dodgerblue',
  },
  imagePickerPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
  },
  imagePickerText: { color: '#ccc', marginTop: 5, fontSize: 16 },
  inputLabel: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 8,
    fontWeight: '400',
    marginTop: 15,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#fff',
    fontSize: 18,
  },
  // --- Novos estilos para o input com ícone ---
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  inputComIcone: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 18,
  },
  calendarIcon: {
    padding: 10,
    paddingRight: 15,
  },
  // ------------------------------------------
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingHorizontal: 20,
    gap: 10,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
  },
  buttonVoltar: { backgroundColor: '#6c757d' },
  buttonAvancar: { backgroundColor: '#1565C0' },
  buttonFinalizar: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  pickerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: { color: '#fff', fontSize: 18 },
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
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: { color: '#fff', fontSize: 18, flex: 1 },
  modalCloseButton: {
    backgroundColor: '#1565C0',
    borderRadius: 25,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
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
  sexoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
    marginTop: 15,
  },
  sexoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sexoButtonSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  sexoButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  sexoButtonTextSelected: { color: '#fff' },
  idadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 15,
  },
  idadeInput: { flex: 1, paddingVertical: 12, color: '#fff', fontSize: 18 },
  unidadeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    margin: 5,
  },
  unidadeButton: { paddingVertical: 10, paddingHorizontal: 15 },
  unidadeButtonSelected: { backgroundColor: '#1565C0', borderRadius: 8 },
  unidadeButtonText: { color: '#ccc', fontSize: 16 },
  unidadeButtonTextSelected: { color: '#fff', fontWeight: 'bold' },
  labelComCheckbox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkboxLabel: { color: '#ccc', marginLeft: 8, fontSize: 16 },
  inputDisabled: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: '#555',
    color: '#888',
  },
  optionalSection: {
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  yesNoContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  yesNoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#555',
  },
  yesNoButtonSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  yesNoButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(40, 167, 69, 0.8)',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  historicoItem: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
  },
  historicoItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historicoItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#fff',
    fontSize: 16,
  },
  inputLabelMenor: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '400',
    marginTop: 15,
  },
});