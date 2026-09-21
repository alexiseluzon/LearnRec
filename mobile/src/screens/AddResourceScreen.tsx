import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/types';
import { resourcesApi } from '../api/resources';
import { ResourceType } from '../types';

type Props = NativeStackScreenProps<AppStackParamList, 'AddResource'>;

const RESOURCE_TYPES: ResourceType[] = ['COURSE', 'ARTICLE', 'VIDEO'];

export default function AddResourceScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('ARTICLE');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUrlValid = /^https?:\/\/.+/.test(url);
  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const canSubmit =
    title.trim().length > 0 && isUrlValid && tags.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await resourcesApi.create(title.trim(), url.trim(), type, tags);
      navigation.goBack();
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? 'Could not add resource. Please try again.';
      Alert.alert('Error', Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Resource</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Intro to React Native"
        placeholderTextColor="#94a3b8"
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="Resource title"
      />

      <Text style={styles.label}>URL</Text>
      <TextInput
        style={styles.input}
        placeholder="https://..."
        placeholderTextColor="#94a3b8"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
        accessibilityLabel="Resource URL"
      />
      {url.length > 0 && !isUrlValid && (
        <Text style={styles.errorText}>Enter a valid URL starting with http(s)://</Text>
      )}

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {RESOURCE_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeChip, type === t && styles.typeChipActive]}
            onPress={() => setType(t)}
            accessibilityRole="button"
            accessibilityLabel={`Select type ${t}`}
          >
            <Text
              style={[styles.typeChipText, type === t && styles.typeChipTextActive]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tags (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="javascript, backend, beginner"
        placeholderTextColor="#94a3b8"
        value={tagsInput}
        onChangeText={setTagsInput}
        autoCapitalize="none"
        accessibilityLabel="Resource tags"
      />

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityLabel="Save resource"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Resource</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '700', color: '#f8fafc', marginBottom: 24 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f8fafc',
  },
  errorText: { color: '#f87171', fontSize: 13, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1e293b',
  },
  typeChipActive: { backgroundColor: '#6366f1' },
  typeChipText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  typeChipTextActive: { color: '#fff' },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: { backgroundColor: '#334155' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});