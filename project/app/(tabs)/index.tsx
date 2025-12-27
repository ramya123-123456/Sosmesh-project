import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image
} from 'react-native';
import { Camera, Mic, MapPin, CircleCheck as CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { useApp } from '@/contexts/AppContext';
import { Logo } from '@/components/Logo';
import { getTheme } from '@/utils/theme';
import { detectSeverity } from '@/utils/validation';
import { translations } from '@/utils/translations';

const PREDEFINED_TAGS = ['food', 'injury', 'lost', 'trapped', 'suspicious', 'other'];

export default function SOSScreen() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [lastSentAlert, setLastSentAlert] = useState<string | null>(null);

  const { user, addAlert, markSafe, darkMode, language } = useApp();
  const theme = getTheme(darkMode);
  const t = translations[language];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(`${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`);
      } else {
        console.log('⚠ Location permission denied, continuing without location');
        setLocation('Location unavailable');
      }
    } catch {
      console.log('⚠ Cannot get location, continuing without location');
      setLocation('Location unavailable');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  /** ✅ Updated to handle saved photo correctly and preview **/
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted) {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setPhoto(result.assets[0].uri);
        }
      } else {
        console.log('⚠ Camera permission denied, continuing without photo');
      }
    } catch (error) {
      console.log('⚠ Cannot access camera, continuing without photo');
    }
  };

  /** ✅ Updated to ensure voice note is saved **/
  const recordVoice = async () => {
    try {
      if (isRecording) {
        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          if (uri) setVoiceNote(uri);
          setRecording(null);
          setIsRecording(false);
        }
      } else {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', '❌ Microphone permission denied');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(newRec);
        setIsRecording(true);
      }
    } catch (error) {
      console.log('⚠ Cannot access microphone, continuing without voice note');
      Alert.alert('Recording Error', '❌ Cannot support voice recording feature');
    }
  };

  const playVoiceNote = async () => {
    if (!voiceNote) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: voiceNote });
      await sound.playAsync();
    } catch {
      Alert.alert('Playback Error', 'Could not play the voice note.');
    }
  };

  /** ✅ Send both photoUri & audioUri so history can show them **/

  const sendSOS = () => {
  if (!user) return;

  const severity = detectSeverity(selectedTags, description);
  const alertId = Date.now().toString();

  const newAlert = {
    id: alertId,
    name: user.name,
    phone: user.phone,
    tags: selectedTags,
    severity,
    completed: false,
    description,
    timestamp: new Date(),
    // ✅ Ensure names match what History uses
    photoUri: photo ? photo : null,
    audioUri: voiceNote ? voiceNote : null,
    location: location || 'Location unavailable',
    sender: true
  };

  // Save alert so History can show it
  addAlert(newAlert);

  setLastSentAlert(alertId);
  Alert.alert('SOS Sent', 'Your emergency alert has been sent successfully.');

  // Reset form
  setSelectedTags([]);
  setDescription('');
  setPhoto(null);
  setVoiceNote(null);
  setIsRecording(false);
  setRecording(null);
};


  const handleImSafe = () => {
    if (lastSentAlert) {
      markSafe(lastSentAlert);
      setLastSentAlert(null);
      Alert.alert('Status Updated', "You've been marked as safe.");
    }
  };

  const canSendSOS = selectedTags.length > 0 && description.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo size={60} />
          <Text style={[styles.title, { color: theme.text }]}>{t.sosTitle}</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.selectTags}</Text>
          <View style={styles.tagsContainer}>
            {PREDEFINED_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: selectedTags.includes(tag) ? theme.primary : theme.surface,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  { color: selectedTags.includes(tag) ? 'white' : theme.text }
                ]}>
                  {t[tag as keyof typeof t] || tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.description}</Text>
          <TextInput
            style={[
              styles.descriptionInput,
              { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder={t.descriptionPlaceholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photo + Voice buttons */}
        <View style={styles.section}>
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={[styles.mediaButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={takePhoto}
            >
              <Camera size={24} color={theme.text} />
              <Text style={[styles.mediaButtonText, { color: theme.text }]}>{t.addPhoto}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={recordVoice}
            >
              <Mic size={24} color={isRecording ? theme.primary : theme.text} />
              <Text style={[styles.mediaButtonText, { color: isRecording ? theme.primary : theme.text }]}>
                {isRecording ? 'Stop Recording' : t.recordVoice}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo preview */}
          {photo && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ marginBottom: 6, color: theme.textSecondary }}>Photo preview:</Text>
              <Image
                source={{ uri: photo }}
                style={{ width: 180, height: 135, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Voice recording feedback */}
          {isRecording && (
            <Text style={{ color: theme.primary, marginTop: 8, textAlign: 'center' }}>
              🔴 Recording... Tap again to stop.
            </Text>
          )}
          {voiceNote && !isRecording && (
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>Voice recorded! 🎤</Text>
              <TouchableOpacity
                onPress={playVoiceNote}
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 8,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  marginTop: 2,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>▶ Play Voice</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Location */}
        {location && (
          <View style={styles.locationContainer}>
            <MapPin size={16} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              Location: {location}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        {lastSentAlert && (
          <TouchableOpacity
            style={[styles.safeButton, { backgroundColor: theme.success }]}
            onPress={handleImSafe}
          >
            <CheckCircle size={24} color="white" />
            <Text style={styles.safeButtonText}>{t.imSafe}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.sosButton,
            {
              backgroundColor: canSendSOS ? theme.primary : theme.textSecondary,
              opacity: canSendSOS ? 1 : 0.5
            }
          ]}
          onPress={sendSOS}
          disabled={!canSendSOS}
        >
          <Text style={styles.sosButtonText}>{t.sendSOS}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ✅ Your original styles remain unchanged */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  tagText: { fontSize: 14, fontWeight: '500' },
  descriptionInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, minHeight: 100 },
  mediaButtons: { flexDirection: 'row', gap: 12 },
  mediaButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  mediaButtonText: { fontSize: 14, fontWeight: '500' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  locationText: { fontSize: 14 },
  bottomButtons: { padding: 20, gap: 12 },
  safeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8 },
  safeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  sosButton: { padding: 20, borderRadius: 12, alignItems: 'center' },
  sosButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});