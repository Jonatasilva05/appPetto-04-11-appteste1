// app/conta.tsx

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, API_URL, API_BASE_URL } from '@/app/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/context/ThemeContext'; 

export default function ContaScreen() {
    // Pega o usuário e as funções do contexto
    const { user, getAuthHeader, signOut, refreshUserData } = useAuth();
    const { colors, theme } = useTheme();
    const router = useRouter();
    
    // Estados locais da tela, inicializados com os dados do contexto
    const [nome, setNome] = useState(user?.nome || '');
    const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [passwordToDelete, setPasswordToDelete] = useState('');

    const handleChooseImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permissão necessária", "Você precisa permitir o acesso à galeria.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setFoto(result.assets[0]);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('nome', nome.trim());

        if (foto) {
            formData.append('foto', {
                uri: foto.uri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            } as any);
        }

        try {
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            // ATUALIZA OS DADOS GLOBAIS (ESSENCIAL!)
            await refreshUserData(); 
            
            Alert.alert('Sucesso!', 'Seu perfil foi atualizado.', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Excluir Conta Permanentemente?',
            'Esta ação é irreversível. Todos os seus dados serão apagados para sempre. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sim, Excluir',
                    style: 'destructive',
                    onPress: () => setDeleteModalVisible(true),
                },
            ]
        );
    };

    

    // Pedir a senha
    const confirmAndDeleteAccount = async () => {
        if (!passwordToDelete) {
            Alert.alert('Atenção', 'A senha é obrigatória para confirmar a exclusão.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/user/delete-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ senha: passwordToDelete }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Não foi possível validar sua senha.');
            }
            
            setDeleteModalVisible(false);
            setPasswordToDelete('');

            Alert.alert('Conta Excluída', data.message, [{ text: 'OK', onPress: () => signOut() }]);

        } catch (error: any) {
            Alert.alert('Erro ao Excluir', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Sua Conta </Text>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleChooseImage}>
            {foto || user.foto_url ? (
              <Image
                source={{
                  uri: foto ? foto.uri : `${API_BASE_URL}${user.foto_url}`,
                }}
                style={[styles.profileImage, { borderColor: colors.primary }]}
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={120}
                color={colors.subtitle}
                style={styles.profileIconPlaceholder}
              />
            )}
            <View
              style={[styles.cameraIcon, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.subtitle }]}>
            Nome de Usuário
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.corFundoInput,
                color: colors.text,
                borderColor: colors.subtitle,
              },
            ]}
            value={nome}
            onChangeText={setNome}
            placeholder="Como você quer ser chamado?"
            placeholderTextColor={colors.corFundoInput}
          />

          <Text style={[styles.label, { color: colors.subtitle }]}>
            E-mail (não pode ser alterado)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.inputDisabled,
              {
                backgroundColor: theme === 'dark' ? '#333' : '#e9ecef',
                color: colors.subtitle,
              },
            ]}
            value={user.email}
            editable={false}
          />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.button }]}
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Salvar Alterações </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
                <Text style={styles.dangerTitle}>Zona de Perigo</Text>
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={handleDeleteAccount}
                    disabled={isSaving}
                >
                    {isSaving 
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Excluir Minha Conta </Text>
                    }
                </TouchableOpacity>
                <Text style={styles.dangerText}>Esta ação é permanente e não pode ser desfeita.</Text>
            </View>
            <Modal
            transparent={true}
            animationType="fade"
            visible={isDeleteModalVisible}
            onRequestClose={() => setDeleteModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <Text style={[styles.modalTitle, { color: colors.textAlert }]}>Confirmação Final</Text>
                    <Text style={[styles.modalText, { color: colors.textAlert }]}>
                        Para sua segurança, digite sua senha para confirmar a exclusão permanente da sua conta.
                    </Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.textAlert, borderColor: colors.subtitle }]}
                        placeholder="Digite sua senha"
                        placeholderTextColor={colors.subtitle}
                        secureTextEntry
                        value={passwordToDelete}
                        onChangeText={setPasswordToDelete}
                    />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={styles.modalButtonCancel}
                            onPress={() => {
                                setDeleteModalVisible(false);
                                setPasswordToDelete('');
                            }}
                        >
                            <Text style={{ color: colors.text }}>Cancelar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.modalButtonConfirm}
                            onPress={confirmAndDeleteAccount}
                            disabled={isSaving}
                        >
                            {isSaving 
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirmar Exclusão </Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: { marginRight: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  profileSection: { alignItems: 'center', marginVertical: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3 },
  profileIconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    textAlign: 'center',
    lineHeight: 120,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 20,
  },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 16, marginBottom: 8, marginTop: 15 },
  input: { padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1 },
  inputDisabled: {},
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dangerZone: {
    margin: 20,
    marginTop: 50,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dangerText: {
    textAlign: 'center',
    color: '#b71c1c',
    marginTop: 15,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#4890F0',
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#d32f2f',
  },
});