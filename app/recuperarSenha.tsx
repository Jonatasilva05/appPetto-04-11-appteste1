// app/recuperarSenha.tsx

import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { API_URL } from '@/app/context/AuthContext';

const backgroundImage = require('@/assets/imagess/images/fundo_login2.jpeg');

export default function RecuperarSenhaScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleContinue = async () => {
        if (!email.trim()) {
            Alert.alert('Atenção', 'Por favor, insira seu e-mail.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verificar-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao verificar e-mail.');
            }
            router.push({
                pathname: '/verificarResposta',
                params: { email: email.trim() },
            });
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
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
                        <Text style={styles.title}>Recuperar Senha</Text>
                        <Text style={styles.subtitle}>
                            Insira seu e-mail para continuar.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="mail-outline"
                                size={24}
                                color="#ccc"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Seu e-mail"
                                placeholderTextColor="#ccc"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleContinue}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Continuar</Text>
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
        marginBottom: 40,
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
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});
