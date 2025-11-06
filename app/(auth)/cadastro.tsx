// app/(auth)/cadastro.tsx

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
    Switch,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// MUDANÇA 1: Adicionado 'useCallback' à importação do React
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { API_URL } from '@/app/context/AuthContext';

const backgroundImage = require('@/assets/imagess/images/cenario-cachorro.jpg');

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.requirementItem}>
        <Ionicons name={met ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={met ? '#28a745' : '#ccc'} />
        <Text style={[styles.requirementText, { color: met ? '#28a745' : '#ccc' }]}>{text}</Text>
    </View>
);

export default function CadastroScreen() {
    const router = useRouter();
    
    // States
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [primeiroPet, setPrimeiroPet] = useState('');
    const [corFavorita, setCorFavorita] = useState('');
    const [isVeterinario, setIsVeterinario] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [crmv, setCrmv] = useState('');
     const [cpf, setCpf] = useState('');
    const [nomeClinica, setNomeClinica] = useState('');
    const [tempoExperiencia, setTempoExperiencia] = useState('');
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [bairro, setBairro] = useState('');
    const [numero, setNumero] = useState('');
    const [cepLoading, setCepLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordRules, setPasswordRules] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });

    useEffect(() => {
        setPasswordRules({
            length: password.length >= 6 && password.length <= 20,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
        });
    }, [password]);

    // Função para verificar email
    const handleCheckEmail = useCallback(async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setIsEmailAvailable(null);
            setEmailError('');
            return;
        }
        setIsCheckingEmail(true);
        setEmailError('');
        setIsEmailAvailable(null);
        try {
            const response = await fetch(`${API_URL}/auth/check-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setIsEmailAvailable(true);
            } else {
                setIsEmailAvailable(false);
                setEmailError(data.message || 'Erro ao verificar e-mail.');
            }
        } catch (error) {
            setIsEmailAvailable(false);
            setEmailError('Não foi possível conectar ao servidor. ');
        } finally {
            setIsCheckingEmail(false);
        }
    }, [email]);

    useEffect(() => {
        const fetchCep = async () => {
            const cepFormatado = cep.replace(/\D/g, '');
            if (cepFormatado.length === 8) {
                setCepLoading(true);
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cepFormatado}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        setEndereco(data.logradouro);
                        setBairro(data.bairro);
                    } else {
                        Alert.alert('CEP não encontrado', 'Por favor, verifique o CEP ou preencha o endereço manualmente.');
                    }
                } catch (e) {
                    Alert.alert('Erro', 'Não foi possível buscar o CEP.');
                } finally {
                    setCepLoading(false);
                }
            }
        };
        fetchCep();
    }, [cep]);

    const handleNextStep = () => {
        if (!nome || !email || !password) {
            setError('Nome, e-mail e senha são obrigatórios.');
            return;
        }
        if (Object.values(passwordRules).some(rule => !rule)) {
            setError('A senha não cumpre os requisitos de segurança.');
            return;
        }
        if (isVeterinario) {
            setStep(2);
        } else {
            handleCadastro();
        }
    };
    
    const handleCadastro = async () => {
        if (emailError) {
            Alert.alert('Atenção', 'O e-mail informado já está em uso. Por favor, utilize outro. ');
            return;
        }
        setLoading(true);
        setError('');
        let payload: any = { nome: nome.trim(), email: email.trim(), senha: password.trim(), pet_primario: primeiroPet.trim(), cor_favorita: corFavorita.trim(), role: isVeterinario ? 'veterinario' : 'tutor', };
        if (isVeterinario) {
            if (!crmv || !nomeClinica || !cpf) { // <-- Adicione cpf à validação
                setError('CRMV, Nome da Clínica e CPF são obrigatórios.'); setLoading(false); return;
            }
            payload = {
            ...payload,
            crmv: crmv?.trim() || null,
            cpf: cpf?.trim() || null,
            nome_clinica: nomeClinica?.trim() || null,
            tempo_experiencia: tempoExperiencia?.trim() || null,
            cep_clinica: cep?.trim() || null,
            endereco: endereco?.trim() || null,
            bairro_clinica: bairro?.trim() || null,
            numero_clinica: numero?.trim() || null,
            };
        }
        try {
            const response = await fetch(`${API_URL}/auth/cadastro`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message); }
            Alert.alert('Sucesso!', 'Seu registro foi realizado. Agora pode fazer o login.', [{ text: 'OK', onPress: () => router.push('/(auth)/login') }],);
        } catch (err: any) { setError(err.message || 'Um erro inesperado ocorreu.');
        } finally { setLoading(false); }
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
            <View style={styles.overlay} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {step === 1 && (
                        <>
                            <Text style={styles.title}>Crie sua Conta</Text>
                            <View style={styles.inputContainer}><Ionicons name="person-outline" size={24} color="#ccc" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Seu Primeiro Nome" value={nome} onChangeText={setNome} /></View>
                            
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={24} color="#ccc" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" onBlur={handleCheckEmail} />
                                {isCheckingEmail && <ActivityIndicator color="#fff" />}
                                {isEmailAvailable === true && <Ionicons name="checkmark-circle" size={24} color="#28a745" />}
                            </View>
                            {emailError ? <Text style={styles.inlineErrorText}>{emailError}</Text> : null}
                            
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={24} color="#ccc" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry={!mostrarSenha} />
                                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.icon}><Ionicons name={mostrarSenha ? 'eye-off' : 'eye'} size={24} color="#ccc" /></TouchableOpacity>
                            </View>

                            <View style={styles.requirementsContainer}>
                                <PasswordRequirement met={passwordRules.length} text="Entre 6 e 20 caracteres" />
                                <PasswordRequirement met={passwordRules.lowercase} text="Uma letra minúscula" />
                                <PasswordRequirement met={passwordRules.uppercase} text="Uma letra MAIÚSCULA" />
                                <PasswordRequirement met={passwordRules.number} text="Um número (0-9)" />
                            </View>
                            
                            <Text style={styles.securityQuestionTitle}>Perguntas de Segurança</Text>
                            <View style={styles.inputContainer}><Ionicons name="paw-outline" size={24} color="#ccc" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Nome do seu primeiro pet?" value={primeiroPet} onChangeText={setPrimeiroPet} /></View>
                            <View style={styles.inputContainer}><Ionicons name="color-palette-outline" size={24} color="#ccc" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Qual sua cor favorita?" value={corFavorita} onChangeText={setCorFavorita} /></View>

                            <View style={styles.switchContainer}>
                                <Text style={styles.switchLabel}>Sou Veterinário </Text>
                                <Switch trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={isVeterinario ? "#274472" : "#f4f3f4"} value={isVeterinario} onValueChange={setIsVeterinario} />
                            </View>
                            
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}
                            <TouchableOpacity style={styles.button} onPress={handleNextStep} disabled={loading}>{loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>{isVeterinario ? 'Próximo' : 'Registrar'}</Text>}</TouchableOpacity>
                        </>
                    )}

                    {step === 2 && (
                         <>
                            <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
                            <Text style={styles.title}>Dados Profissionais</Text>
                            <View style={styles.inputContainer}><Ionicons name="medkit-outline" size={24} color="#ccc" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="CRMV (ex: 12345-SP)" value={crmv} onChangeText={setCrmv} /></View>
                            <View style={styles.inputContainer}>
                                <Ionicons name="id-card-outline" size={24} color="#ccc" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric"maxLength={14} />
                            </View>
                    
                    <View style={styles.inputContainer}>
                        <Ionicons name="business-outline" size={24} color="#ccc" style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Nome da Clínica" value={nomeClinica} onChangeText={setNomeClinica} />
                    </View>
                            <View style={styles.inputContainer}><Ionicons name="time-outline" size={24} color="#ccc" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Tempo de experiência (ex: 5 anos)" value={tempoExperiencia} onChangeText={setTempoExperiencia} /></View>
                            <Text style={styles.securityQuestionTitle}>Endereço da Clínica</Text>
                            <View style={styles.inputContainer}><Ionicons name="map-outline" size={24} color="#ccc" style={styles.inputIcon} /><TextInput style={styles.input} placeholder="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" maxLength={9} />{cepLoading && <ActivityIndicator style={{marginLeft: 10}} color="#fff"/>}</View>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} placeholder="Endereço (Rua, Av.)" placeholderTextColor="#fff" value={endereco} onChangeText={setEndereco} />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput style={[styles.input, {marginTop: 20}]} placeholder="Bairro" placeholderTextColor="#fff" value={bairro} onChangeText={setBairro} />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput style={[styles.input, {marginTop: 20}]} placeholder="Número" placeholderTextColor="#fff" value={numero} onChangeText={setNumero} keyboardType="numeric" />
                            </View>
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}
                            <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>{loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Finalizar Cadastro</Text>}</TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}><Text style={styles.bottomText}>Já tem uma conta? <Text style={styles.linkText}>Faça Login</Text></Text></TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: { flex: 1, justifyContent: 'center' },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 75,
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    width: '100%',
    marginBottom: 20,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, paddingVertical: 15, color: '#fff' },
  icon: { padding: 5 },
  button: {
    backgroundColor: '#274472',
    borderRadius: 30,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  bottomText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  linkText: { color: '#5899E2', fontWeight: 'bold' },
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityQuestionTitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Poppins-Regular',
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 1,
    paddingTop: 20,
    marginTop: 5,
  },
  requirementsContainer: { marginBottom: 20, paddingLeft: 10 },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: { marginLeft: 8, fontSize: 14 },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  switchLabel: { color: '#fff', fontSize: 16 },
  backButton: { position: 'absolute', top: 60, left: 0, zIndex: 10 },
  // MUDANÇA 2: Adicionado o estilo 'inlineErrorText' que estava faltando
  inlineErrorText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginTop: -15,
    marginBottom: 15,
  },
});