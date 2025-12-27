import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Logo } from '@/components/Logo';
import { validatePhoneNumber } from '@/utils/validation';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/utils/theme';
import { translations } from '@/utils/translations';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { setUser, darkMode, language } = useApp();
  const theme = getTheme(darkMode);
  const t = translations[language];

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location access is important for emergency services.');
      } else {
        console.log('✅ Location permission granted');
      }
    } catch (error) {
      console.log('⚠ Cannot request location permission, continuing without location');
    }
  };

  const handleLogin = async () => {
    setPhoneError('');
    
    if (!name.trim()) {
      setPhoneError('Please enter your name');
      return;
    }
    
    if (!validatePhoneNumber(phone)) {
      setPhoneError(t.phoneError);
      return;
    }
    
    setUser({ name: name.trim(), phone });
    await requestLocationPermission();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Logo size={120} />
        <Text style={[styles.title, { color: theme.text }]}>{t.loginTitle}</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>{t.nameLabel}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>{t.phoneLabel}</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.surface, 
                  color: theme.text, 
                  borderColor: phoneError ? theme.error : theme.border 
                }
              ]}
              value={phone}
              onChangeText={(text: React.SetStateAction<string>) => {
                setPhone(text);
                setPhoneError('');
              }}
              placeholder="10-digit phone number"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={10}
            />
            {phoneError ? (
              <Text style={[styles.errorText, { color: theme.error }]}>
                ❌ {phoneError}
              </Text>
            ) : null}
          </View>
          
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={!name.trim() || !phone.trim()}
          >
            <Text style={styles.loginButtonText}>{t.loginButton}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});