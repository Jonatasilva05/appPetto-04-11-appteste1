// app/components/BreedInfoCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BreedInfo } from '@/data/databaseBreeds';

interface BreedInfoCardProps {
  info: BreedInfo;
}

const InfoRow = ({
  icon,
  text,
  color,
}: {
  icon: any;
  text: string;
  color: string;
}) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color={color} style={styles.icon} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const BreedInfoCard: React.FC<BreedInfoCardProps> = ({ info }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sobre a Raça: {info.raca}</Text>
      <Text style={styles.description}>{info.descricao}</Text>

      <View style={styles.pointsContainer}>
        <View style={styles.pointsColumn}>
          <Text style={styles.subtitle}>Características Principais</Text>
          {info.caracteristicas.map((point, index) => (
            <InfoRow
              key={`char-${index}`}
              icon="checkmark-circle-outline"
              text={point}
              color="#28a745"
            />
          ))}
        </View>

        <View style={styles.pointsColumn}>
          <Text style={styles.subtitle}>Cuidados Essenciais</Text>
          {info.cuidados.map((point, index) => (
            <InfoRow
              key={`care-${index}`}
              icon="heart-circle-outline"
              text={point}
              color="#007bff"
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2E35',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#58707A',
    lineHeight: 22,
    marginBottom: 20,
  },
  pointsContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  pointsColumn: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2E35',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#58707A',
    flex: 1,
  },
});

export default BreedInfoCard;
