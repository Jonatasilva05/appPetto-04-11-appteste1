// app/+not-found.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';

const NotFound404: React.FC = () => {
  return (
    <View style={styles.page}>
      <Image
        source={require('@/assets/imagess/notfund.gif')}
        style={styles.background}
        contentFit="cover"
        transition={100}
      />
      <Text style={styles.title}>404</Text>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Pagina Não encontrada </Text>
        <Text style={styles.paragraph}>
          Por favor Retorne para a pagina Inicial{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>Pagina Inicial </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#000',
    paddingLeft: '35%',
  },
  content: {
    alignItems: 'center',
    alignContent: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
  },
  paragraph: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
  },
  link: {
    backgroundColor: '#39ac31',
    fontSize: 25,
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
});

export default NotFound404;
