import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { resourcesApi } from '../api/resources';
import { Resource } from '../types';

type Props = NativeStackScreenProps<AppStackParamList, 'ResourceDetail'>;

export default function ResourceDetailScreen({ route }: Props) {
  const { resourceId } = route.params;
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRating, setIsRating] = useState(false);

  const loadResource = useCallback(async () => {
    try {
      const data = await resourcesApi.getOne(resourceId);
      setResource(data);
    } catch {
      Alert.alert('Error', 'Could not load this resource.');
    } finally {
      setIsLoading(false);
    }
  }, [resourceId]);

  useFocusEffect(
    useCallback(() => {
      loadResource();
    }, [loadResource]),
  );

  const handleRate = async (score: number) => {
    setIsRating(true);
    try {
      await resourcesApi.rate(resourceId, score);
      await loadResource();
    } catch {
      Alert.alert('Error', 'Could not save your rating. Please try again.');
    } finally {
      setIsRating(false);
    }
  };

  const handleOpenUrl = () => {
    if (resource) Linking.openURL(resource.url);
  };

  if (isLoading || !resource) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{resource.title}</Text>
      <Text style={styles.type}>{resource.type}</Text>

      <View style={styles.tagRow}>
        {resource.tags.map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={handleOpenUrl}
        accessibilityRole="button"
        accessibilityLabel="Open resource link"
      >
        <Text style={styles.linkButtonText}>Open Resource ↗</Text>
      </TouchableOpacity>

      <Text style={styles.ratingLabel}>Rate this resource</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((score) => (
          <TouchableOpacity
            key={score}
            onPress={() => handleRate(score)}
            disabled={isRating}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${score} stars`}
          >
            <Text style={styles.star}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isRating && <ActivityIndicator style={{ marginTop: 8 }} color="#6366f1" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24, paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 24, fontWeight: '700', color: '#f8fafc', marginBottom: 6 },
  type: { color: '#818cf8', fontSize: 13, fontWeight: '600', marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 24 },
  tagChip: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { color: '#cbd5e1', fontSize: 12 },
  linkButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  linkButtonText: { color: '#818cf8', fontSize: 15, fontWeight: '600' },
  ratingLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 12 },
  star: { fontSize: 36, color: '#fbbf24' },
});