// app/redefinirSenha.tsx

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
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/app/context/AuthContext';

const backgroundImage = require('@/assets/imagess/images/fundo_login2.jpeg');

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.requirementItem}>
        <Ionicons
            name={met ? 'checkmark-circle' : 'ellipse-outline'}
            size={18}
            color={met ? '#28a745' : '#ccc'}
        />
        <Text style={[styles.requirementText, { color: met ? '#28a745' : '#ccc' }]}>
            {text}
        </Text>
    </View>
);

export default function RedefinirSenhaScreen() {
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { token } = useLocalSearchParams<{ token: string }>();

    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    const [passwordRules, setPasswordRules] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });

    useEffect(() => {
        setPasswordRules({
            length: novaSenha.length >= 6 && novaSenha.length <= 20,
            uppercase: /[A-Z]/.test(novaSenha),
            lowercase: /[a-z]/.test(novaSenha),
            number: /\d/.test(novaSenha),
        });
        setPasswordsMatch(novaSenha !== '' && novaSenha === confirmarSenha);
    }, [novaSenha, confirmarSenha]);

    const handleResetPassword = async () => {
        if (Object.values(passwordRules).some((rule) => !rule)) {
            Alert.alert(
                'Erro',
                'A nova senha não cumpre todos os requisitos de segurança.',
            );
            return;
        }
        if (!passwordsMatch) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/redefinir-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, novaSenha }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            Alert.alert(
                'Sucesso!',
                'Sua senha foi redefinida. Agora você pode fazer o login.',
                [{ text: 'OK', onPress: () => router.replace('/login') }],
            );
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
                    <View style={styles.content}>
                        <Text style={styles.title}>Redefinir Senha</Text>
                        <Text style={styles.subtitle}>Digite sua nova senha abaixo.</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={24}
                                color="#ccc"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Nova Senha"
                                placeholderTextColor="#ccc"
                                secureTextEntry={!mostrarNovaSenha}
                                value={novaSenha}
                                onChangeText={setNovaSenha}
                            />
                            <TouchableOpacity
                                onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                                style={styles.icon}
                            >
                                <Ionicons
                                    name={mostrarNovaSenha ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#ccc"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.requirementsContainer}>
                            <PasswordRequirement
                                met={passwordRules.length}
                                text="Entre 6 e 20 caracteres"
                            />
                            <PasswordRequirement
                                met={passwordRules.lowercase}
                                text="Uma letra minúscula"
                            />
                            <PasswordRequirement
                                met={passwordRules.uppercase}
                                text="Uma letra MAIÚSCULA"
                            />
                            <PasswordRequirement
                                met={passwordRules.number}
                                text="Um número (0-9)"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={24}
                                color="#ccc"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmar Nova Senha"
                                placeholderTextColor="#ccc"
                                secureTextEntry={!mostrarConfirmarSenha}
                                value={confirmarSenha}
                                onChangeText={setConfirmarSenha}
                            />
                            <TouchableOpacity
                                onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                                style={styles.icon}
                            >
                                <Ionicons
                                    name={mostrarConfirmarSenha ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#ccc"
                                />
                            </TouchableOpacity>
                        </View>

                        {confirmarSenha.length > 0 && (
                            <View
                                style={{ width: '100%', paddingLeft: 10, marginBottom: 15 }}
                            >
                                <PasswordRequirement
                                    met={passwordsMatch}
                                    text={
                                        passwordsMatch
                                            ? 'As senhas são idênticas'
                                            : 'As senhas não são idênticas'
                                    }
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Salvar Nova Senha</Text>
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
        width: '100%',
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, paddingVertical: 15, color: '#fff' },
    icon: { padding: 5 },
    button: {
        backgroundColor: '#28a745',
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
    requirementsContainer: { width: '100%', paddingLeft: 10, marginBottom: 15 },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    requirementText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
});
