import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { resourcesApi } from '../api/resources';
import { useAuth } from '../context/AuthContext';
import { Resource } from '../types';

type Props = NativeStackScreenProps<AppStackParamList, 'ResourceList'>;

export default function ResourceListScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadResources = useCallback(async () => {
    try {
      const data = await resourcesApi.list();
      setResources(data);
    } catch {
      Alert.alert('Error', 'Could not load resources. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // refetch every time this screen comes into focus (e.g. after adding a resource)
  useFocusEffect(
    useCallback(() => {
      loadResources();
    }, [loadResources]),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadResources();
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resources</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Recommendations')}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="View recommendations"
          >
            <Text style={styles.iconButtonText}>✨</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Text style={styles.iconButtonText}>⎋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={resources}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No resources yet. Add one!</Text>
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
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardType}>{item.type}</Text>
              <Text style={styles.cardRatingCount}>
                {item._count?.ratings ?? 0} ratings
              </Text>
            </View>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddResource')}
        accessibilityRole="button"
        accessibilityLabel="Add new resource"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#f8fafc' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: { fontSize: 18 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { color: '#94a3b8', fontSize: 15, marginTop: 60 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#f8fafc', marginBottom: 6 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardType: { color: '#818cf8', fontSize: 12, fontWeight: '600' },
  cardRatingCount: { color: '#94a3b8', fontSize: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { color: '#cbd5e1', fontSize: 11 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2 },
});