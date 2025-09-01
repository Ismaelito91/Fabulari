import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface PseudoEditModalProps {
  visible: boolean;
  currentPseudo: string;
  onSave: (newPseudo: string) => void;
  onClose: () => void;
}

const PseudoEditModal: React.FC<PseudoEditModalProps> = ({
  visible,
  currentPseudo,
  onSave,
  onClose,
}) => {
  const [tempPseudo, setTempPseudo] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setTempPseudo(currentPseudo);
    }
  }, [visible, currentPseudo]);

  const handleSave = () => {
    const trimmed = tempPseudo.trim();
    if (trimmed.length > 0) {
      onSave(trimmed);
    } else {
      Alert.alert('Erreur', 'Le pseudo ne peut pas être vide');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Modifier votre pseudo</Text>
          <TextInput
            style={styles.input}
            onChangeText={setTempPseudo}
            value={tempPseudo}
            placeholder="Entrez votre nouveau pseudo"
            maxLength={20}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose}>
              <Text style={styles.textStyle}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
              <Text style={styles.textStyle}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
  buttonCancel: {
    backgroundColor: '#ccc',
  },
  buttonSave: {
    backgroundColor: '#4CAF50',
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
  },
});

export default PseudoEditModal;
