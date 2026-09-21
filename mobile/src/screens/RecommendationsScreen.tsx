import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { recommendationsApi } from '../api/recommendations';
import { Resource } from '../types';

type Props = NativeStackScreenProps<AppStackParamList, 'Recommendations'>;

export default function RecommendationsScreen({ navigation }: Props) {
  const [recommendations, setRecommendations] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    try {
      const data = await recommendationsApi.getForUser();
      setRecommendations(data);
    } catch {
      Alert.alert('Error', 'Could not load recommendations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecommendations();
    }, [loadRecommendations]),
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>For You</Text>
      <Text style={styles.headerSubtitle}>
        Based on resources you've rated highly
      </Text>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Rate a few resources to get personalized recommendations.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('ResourceDetail', { resourceId: item.id })
            }
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardType}>{item.type}</Text>
            <View style={styles.tagRow}>
              {item.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#f8fafc', paddingHorizontal: 20 },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20,
  },
  emptyText: { color: '#94a3b8', fontSize: 15, textAlign: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#f8fafc', marginBottom: 4 },
  cardType: { color: '#818cf8', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { color: '#cbd5e1', fontSize: 11 },
});