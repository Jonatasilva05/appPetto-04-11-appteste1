// app/(auth)/login.tsx
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth, API_URL } from '@/app/context/AuthContext';

const backgroundImage = require('@/assets/imagess/images/fundo_login2.jpeg');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.errorCode === 'USER_NOT_FOUND') {
          Alert.alert(
            'Usuário não cadastrado',
            'Não encontramos uma conta com este e-mail. Deseja criar uma?',
            [
              {
                text: 'Cadastrar (Tutor)',
                onPress: () => router.push('/(auth)/cadastro'),
                style: 'default',
              },
              { text: 'Tentar Novamente', style: 'cancel' },
            ]
          );
        } else {
          throw new Error(data.message || 'Credenciais inválidas.');
        }
      } else {
        if (data?.token && data?.role) {
          await signIn(data.token, data.role);

          // redireciona conforme o tipo
          if (data.role === 'veterinario') {
            router.replace('/(vet)/dashboard');
          } else {
            router.replace('/(tabs)');
          }
        } else {
          throw new Error('Resposta do servidor incompleta.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao entrar.');
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
          style={styles.kavContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.content}>
              <Text style={styles.logo}>Petto</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={30} color="#ccc" style={styles.inputIcon} />
                <TextInput
                  style={styles.input2}
                  placeholder="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#ccc"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={30} color="#ccc" style={styles.inputIcon} />
                <TextInput
                  style={styles.input2}
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarSenha}
                  placeholderTextColor="#ccc"
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.icon}>
                  <Ionicons name={mostrarSenha ? 'eye-off' : 'eye'} size={34} color="#ccc" />
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/recuperarSenha')}>
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <TouchableOpacity onPress={() => router.push('/(auth)/cadastro')}>
                  <Text style={[styles.signUpText, { marginTop: 8 }]}>
                    Não tem conta? <Text style={styles.linkText}>Cadastre-se aqui</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' },
  kavContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: { alignItems: 'center', width: '100%' },
  logo: {
    fontSize: 75,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    fontFamily: 'Poppins',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 30,
  },
  inputIcon: { marginRight: 10, fontSize: 30 },
  input2: { flex: 1, fontSize: 20, paddingVertical: 14, color: '#fff' },
  icon: { paddingLeft: 10 },
  button: {
    backgroundColor: '#274472',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 22, fontFamily: 'Poppins' },
  signupContainer: { marginTop: 40, alignItems: 'center' },
  signUpText: { color: '#ccc', fontSize: 16, fontFamily: 'Poppins', textAlign: 'center' },
  linkText: { color: '#395aff', fontWeight: 'bold', textDecorationLine: 'underline' },
  errorText: { color: '#ff4d4d', textAlign: 'center', marginVertical: 10, fontSize: 16, fontWeight: 'bold' },
  forgotPasswordText: { color: '#5899E2', fontSize: 16, textAlign: 'center', marginTop: 20 },
});
