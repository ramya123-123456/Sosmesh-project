import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Search, Phone } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/utils/theme';
import { translations } from '@/utils/translations';

const EMERGENCY_CONTACTS = [
  { number: '100', key: 'police' },
  { number: '108', key: 'ambulance' },
  { number: '181', key: 'womenHelpline' },
  { number: '1930', key: 'cyberCrime' },
  { number: '112', key: 'nationalEmergency' },
  { number: '1091', key: 'domesticViolence' },
  { number: '1098', key: 'childHelpline' },
  { number: '101', key: 'fireServices' },
  { number: '104', key: 'healthAdvice' },
  { number: '102', key: 'govtAmbulance' },
  { number: '1962', key: 'animalHelpline' },
  { number: '1073', key: 'roadAccident' },
  { number: '1070', key: 'disasterManagement' },
  { number: '1075', key: 'covidHelpline' },
];

export default function ContactsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { darkMode, language } = useApp();
  const theme = getTheme(darkMode);
  const t = translations[language];

  const filteredContacts = EMERGENCY_CONTACTS.filter(contact => {
    const name = t[contact.key as keyof typeof t] as string;
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.includes(searchQuery)
    );
  });

  const makeCall = (number: string) => {
    try {
      Linking.openURL(`tel:${number}`);
    } catch (error) {
      console.log('⚠ Cannot make call, please dial manually:', number);
      Alert.alert('Call Error', `Please dial ${number} manually`);
    }
  };

  const renderContactItem = ({ item }: { item: typeof EMERGENCY_CONTACTS[0] }) => {
    const name = t[item.key as keyof typeof t] as string;
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => makeCall(item.number)}
      >
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.contactNumber, { color: theme.textSecondary }]}>{item.number}</Text>
        </View>
        <View style={[styles.callButton, { backgroundColor: theme.primary }]}>
          <Phone size={20} color="white" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t.contactsTitle}</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchContacts}
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.number}
        contentContainerStyle={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  contactsList: {
    padding: 20,
    paddingTop: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactNumber: {
    fontSize: 14,
    marginTop: 2,
  },
  callButton: {
    padding: 12,
    borderRadius: 50,
  },
});