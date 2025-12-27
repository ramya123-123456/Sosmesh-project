 // app/(tabs)/history.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Search, MapPin, Clock } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

import { useApp } from '@/contexts/AppContext';
import { getTheme } from '@/utils/theme';
import { translations } from '@/utils/translations';
import { fetchSOSHistory } from '@/utils/supabase';
import { OFFLINE_HISTORY } from '@/utils/offlineData';

const FILTER_TABS = ['All', 'High', 'Medium', 'Low', 'Completed'];

/**
 * Central Alert type used in UI. timestamp is Date for consistent rendering.
 * Some alerts may store coordinates under different keys; the code below
 * tries to detect common variants (location, coords, latitude/longitude).
 */
type Alert = {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  severity: string;
  completed?: boolean;
  description?: string;
  timestamp: Date;
  sender?: boolean;
  photoUri?: string;
  audioUri?: string;
  // optional raw coords (various shapes may be present in data)
  locationAddress?: string;
  location?: { latitude?: number; longitude?: number } | null;
  coords?: { latitude?: number; longitude?: number } | null;
  latitude?: number;
  longitude?: number;
  // ... other possible fields
};

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [apiAlerts, setApiAlerts] = useState<Alert[]>([]);
  const [usingOfflineData, setUsingOfflineData] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { alerts = [], darkMode, language } = useApp(); // alerts from context
  const theme = getTheme(darkMode);
  const t = (translations[language] ?? {}) as Record<string, string>;

  // load API/offline history and ensure timestamp is Date
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = (await fetchSOSHistory()) || [];
        const parsed = (data || []).map((a: any) => ({
          ...a,
          timestamp: a?.timestamp ? new Date(a.timestamp) : new Date(),
        })) as Alert[];
        setApiAlerts(parsed);
        setUsingOfflineData(false);
      } catch (err) {
        console.warn('⚠ Cannot fetch history, using offline data', err);
        const parsedOffline = (OFFLINE_HISTORY || []).map((a: any) => ({
          ...a,
          timestamp: a?.timestamp ? new Date(a.timestamp) : new Date(),
        })) as Alert[];
        setApiAlerts(parsedOffline);
        setUsingOfflineData(true);
      }
    };
    loadHistory();
  }, []);

  // Normalize context alerts into same shape (timestamp => Date)
  const normalizedContextAlerts: Alert[] = (alerts || []).map((a: any) => ({
    ...a,
    timestamp: a?.timestamp ? new Date(a.timestamp) : new Date(),
  }));

  // Combined alerts used for the UI
  const allAlerts: Alert[] = [...normalizedContextAlerts, ...apiAlerts];

  // Debug helper: print sample to console so you can inspect actual fields
  useEffect(() => {
    if (allAlerts.length > 0) {
      console.log('History: first alert sample ->', allAlerts[0]);
    }
  }, [allAlerts]);

  // Cache for reverse-geocoded addresses keyed by alert id
  const [locationCache, setLocationCache] = useState<Record<string, string>>({});

  // Helper: try to extract lat/lon from a few common shapes
  const extractLatLon = (item: any) => {
  if (typeof item.location === 'string') {
    const parts = item.location.split(',').map((s: string) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lon: parts[1] };
    }
  }

  // existing checks unchanged ...
  const latRaw =
    item?.location?.latitude ??
    item?.coords?.latitude ??
    item?.latitude ??
    item?.lat;
  const lonRaw =
    item?.location?.longitude ??
    item?.coords?.longitude ??
    item?.longitude ??
    item?.lon ??
    item?.lng;

  const lat = parseFloat(latRaw);
  const lon = parseFloat(lonRaw);

  if (!isNaN(lat) && !isNaN(lon)) {
    return { lat, lon };
  }
  return null;
};

  // When alerts change, reverse-geocode any that lack a human-readable address
  useEffect(() => {
    (async () => {
      for (const a of allAlerts) {
        if (a.locationAddress) continue; // already have readable address
        if (locationCache[a.id]) continue; // already resolved
        const coords = extractLatLon(a as any);
        if (!coords) continue; // no coords to resolve
        try {
          const geo = await Location.reverseGeocodeAsync({
  latitude: coords.lat,
  longitude: coords.lon,
});

// ✅ Just show the village/town/city name
const villageName = geo && geo.length > 0
  ? (geo[0].district || geo[0].city || geo[0].subregion || geo[0].name || 'Unknown')
  : `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`;

setLocationCache((prev) => ({
  ...prev,
  [a.id]: villageName,
}));
          const addr =
           geo && geo.length > 0
  ? `${geo[0].name || geo[0].street || ''}${
      geo[0].subregion ? ', ' + geo[0].subregion : ''
    }${geo[0].district ? ', ' + geo[0].district : ''}${
      geo[0].city || geo[0].region ? ', ' + (geo[0].city || geo[0].region) : ''
    }`
  : `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`

setLocationCache((prev) => ({
  ...prev,
  [a.id]: addr,
}));
        } catch (e) {
          // fallback to raw coords string
          setLocationCache((prev) => ({
            ...prev,
            [a.id]: `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`,
          }));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAlerts]);

  
// (sender === true means it came from a real user on this device or verified sender)
const realAlertsOnly = allAlerts.filter(alert => {
  return alert.sender === true; // ✅ keep only actual user-sent messages
});

// 2. Then apply your existing search & severity filters
const filteredAlerts = realAlertsOnly.filter((alert) => {
  const name = (alert.name || '').toString().toLowerCase();
  const phone = (alert.phone || '').toString();
  const tags = alert.tags || [];

  const matchesSearch =
    name.includes(searchQuery.toLowerCase()) ||
    phone.includes(searchQuery) ||
    tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

  const matchesFilter =
    activeFilter === 'All' ||
    (activeFilter === 'Completed' && alert.completed) ||
    (activeFilter !== 'Completed' &&
      alert.severity === activeFilter &&
      !alert.completed);

  return matchesSearch && matchesFilter;
});


  // Play audio safely (audioUri may be undefined)
  const playAudio = async (uri?: string) => {
    if (!uri) return;
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.warn('Audio play failed', err);
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync().catch(() => {});
    };
  }, [sound]);

  // Tweak image URIs (add file:// if needed)
  const fixImageUri = (uri?: string) => {
    if (!uri) return undefined;
    if (uri.startsWith('/')) return `file://${uri}`;
    return uri;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return '#DC2626';
      case 'Medium':
        return '#F59E0B';
      case 'Low':
        return '#10B981';
      default:
        return theme.textSecondary;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High':
        return '🔴';
      case 'Medium':
        return '🟠';
      case 'Low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const renderAlertItem = ({ item }: { item: Alert }) => {
    const dateObj = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);
    const coords = extractLatLon(item as any);
    const readableLocation =
      item.locationAddress || locationCache[item.id] || (coords ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : 'N/A');

    // debug: if needed uncomment
    // console.log('Rendering item', item.id, { photoUri: item.photoUri, readableLocation });

    const imgUri = fixImageUri(item.photoUri);

    return (
      <View style={[styles.alertItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <Text style={[styles.alertName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.alertPhone, { color: theme.textSecondary }]}>{item.phone}</Text>
          </View>
          <View style={styles.severityContainer}>

{/* ✅ INSERTED MEDIA PREVIEW BLOCK HERE */}
            <Text style={styles.severityIcon}>{getSeverityIcon(item.severity)}</Text>
            <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
              {t[item.severity.toLowerCase()] || item.severity}
            </Text>
          </View>
        </View>

        <Text style={[styles.alertDescription, { color: theme.text }]}>{item.description}</Text>

        <View style={styles.alertTags}>
          {(item.tags || []).map((tag, index) => (
            <View key={index} style={[styles.alertTag, { backgroundColor: theme.primary }]}>
              <Text style={styles.alertTagText}>{t[tag] || tag}</Text>
            </View>
          ))}
        </View>

        {/* Photo (if available) */}
       {/* Photo (if available) */}
{imgUri ? (
  <Image
    source={{ uri: imgUri }}
    style={{ width: 200, height: 200, marginBottom: 8, borderRadius: 10 }}
    resizeMode="cover"
  />
) : (
  <View style={{ marginBottom: 8 }} />
)}

{/* Audio (if available) */}
{item.audioUri ? (
  <TouchableOpacity
    onPress={() => playAudio(item.audioUri)}
    style={{
      backgroundColor: '#FF4C4C',
      padding: 10,
      marginBottom: 8,
      borderRadius: 5,
      alignSelf: 'flex-start',
    }}
  >
    <Text style={{ color: 'white' }}>▶ Play Recording</Text>
  </TouchableOpacity>
) : null}

        <View style={styles.alertFooter}>
          <View style={styles.locationRow}>
            <MapPin size={14} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>{readableLocation}</Text>
          </View>

          <View style={styles.timeRow}>
            <Clock size={14} color={theme.textSecondary} />
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>
              {dateObj.toLocaleTimeString()} - {dateObj.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.completed && (
          <View style={[styles.completedBadge, { backgroundColor: theme.success }]}>
            <Text style={styles.completedText}>{t.completed}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t.historyTitle}</Text>

        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          {FILTER_TABS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                { backgroundColor: activeFilter === filter ? theme.primary : theme.surface, borderColor: theme.border },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterTabText, { color: activeFilter === filter ? 'white' : theme.text }]}>
                {filter === 'All' ? t.all : filter === 'Completed' ? t.completed : t[filter.toLowerCase()] || filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList data={filteredAlerts} renderItem={renderAlertItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.alertsList} showsVerticalScrollIndicator={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filterTabs: { marginBottom: 10 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterTabText: { fontSize: 14, fontWeight: '500' },
  alertsList: { padding: 20, paddingTop: 0 },
  alertItem: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 18, fontWeight: 'bold' },
  alertPhone: { fontSize: 14, marginTop: 2 },
  severityContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  severityIcon: { fontSize: 16 },
  severityText: { fontSize: 14, fontWeight: '600' },
  alertDescription: { fontSize: 16, marginBottom: 12 },
  alertTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  alertTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  alertTagText: { color: 'white', fontSize: 12, fontWeight: '500' },
  alertFooter: { gap: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12 },
  completedBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  completedText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});