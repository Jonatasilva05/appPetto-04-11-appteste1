import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HistoricoSaudeItem {
  id: string;
  name: string;
  data_aplicacao: string;
  data_desconhecida: boolean;
}

const HistoricoItemCard = React.memo(
  ({
    item,
    onDateChange,
    onDateUnknownToggle,
    onRemove,
  }: {
    item: HistoricoSaudeItem;
    onDateChange: (text: string) => void;
    onDateUnknownToggle: () => void;
    onRemove: () => void;
  }) => {
    return (
      <View style={styles.historicoItem}>
        <View style={styles.historicoItemHeader}>
          <Text
            style={styles.historicoItemTitle}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="trash-bin-outline" size={22} color="#ff4d4d" />
          </TouchableOpacity>
        </View>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={[
              styles.dateInput,
              item.data_desconhecida && styles.inputDisabled,
            ]}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#888"
            value={item.data_aplicacao}
            onChangeText={onDateChange}
            maxLength={10}
            keyboardType="number-pad"
            editable={!item.data_desconhecida}
          />
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={onDateUnknownToggle}
          >
            <Ionicons
              name={item.data_desconhecida ? 'checkbox' : 'square-outline'}
              size={24}
              color="#ccc"
            />
            <Text style={styles.checkboxLabel}>Não lembro</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
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
  inputDisabled: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: '#555',
    color: '#888',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkboxLabel: { color: '#ccc', marginLeft: 8, fontSize: 16 },
});

export default HistoricoItemCard;
