// app/verificarResposta.tsx

import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/app/context/AuthContext';

const backgroundImage = require('@/assets/imagess/images/fundo_login2.jpeg');

export default function VerificarRespostaScreen() {
    const [resposta, setResposta] = useState('');
    const [loading, setLoading] = useState(false);
    const [tipoPergunta, setTipoPergunta] = useState<'pet' | 'cor'>('pet');
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();

    const handleVerification = async () => {
        if (!resposta.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha a resposta.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verificar-resposta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    tipo_pergunta: tipoPergunta,
                    resposta: resposta.trim(),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao verificar resposta.');
            }
            router.push({
                pathname: '/redefinirSenha',
                params: { token: data.token },
            });
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    const esqueciAPrimeiraResposta = () => {
        setTipoPergunta('cor');
        setResposta('');
    };

    return (
        <ImageBackground
            source={backgroundImage}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={30} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <Text style={styles.title}>Verificação de Segurança</Text>

                        {tipoPergunta === 'pet' ? (
                            <>
                                <Text style={styles.subtitle}>
                                    Qual o nome do seu primeiro pet?
                                </Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="paw-outline"
                                        size={24}
                                        color="#ccc"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nome do pet"
                                        placeholderTextColor="#ccc"
                                        value={resposta}
                                        onChangeText={setResposta}
                                    />
                                </View>
                                <TouchableOpacity onPress={esqueciAPrimeiraResposta}>
                                    <Text style={styles.forgotLink}>Esqueci a resposta</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.subtitle}>Qual a sua cor favorita?</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons
                                        name="color-palette-outline"
                                        size={24}
                                        color="#ccc"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Sua cor favorita"
                                        placeholderTextColor="#ccc"
                                        value={resposta}
                                        onChangeText={setResposta}
                                    />
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleVerification}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verificar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    content: { alignItems: 'center', width: '100%', maxWidth: 400 },
    backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Poppins-Bold',
    },
    subtitle: {
        fontSize: 18,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: 'Poppins-Regular',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 15,
        marginBottom: 20,
        width: '100%',
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, paddingVertical: 15, color: '#fff' },
    button: {
        backgroundColor: '#274472',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    forgotLink: {
        color: '#5899E2',
        textAlign: 'center',
        marginBottom: 20,
        textDecorationLine: 'underline',
        fontSize: 16,
    },
});
