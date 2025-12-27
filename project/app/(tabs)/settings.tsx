import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Moon, Sun, Globe } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/utils/theme';
import { translations } from '@/utils/translations';

const LANGUAGES = [
  { code: 'en' as const, name: 'English', nativeName: 'English' },
  { code: 'hi' as const, name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te' as const, name: 'Telugu', nativeName: 'తెలుగు' },
];

export default function SettingsScreen() {
  const { darkMode, toggleDarkMode, language, setLanguage } = useApp();
  const theme = getTheme(darkMode);
  const t = translations[language];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t.settingsTitle}</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.settingSection, { borderColor: theme.border }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              {darkMode ? <Moon size={24} color={theme.text} /> : <Sun size={24} color={theme.text} />}
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t.darkMode}</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={darkMode ? 'white' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.settingSection, { borderColor: theme.border }]}>
          <View style={styles.settingHeader}>
            <Globe size={24} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t.language}</Text>
          </View>
          
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                {
                  backgroundColor: language === lang.code ? theme.primary : 'transparent',
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setLanguage(lang.code)}
            >
              <Text style={[
                styles.languageText,
                { color: language === lang.code ? 'white' : theme.text }
              ]}>
                {lang.nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    borderBottomWidth: 1,
    paddingBottom: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  languageOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});