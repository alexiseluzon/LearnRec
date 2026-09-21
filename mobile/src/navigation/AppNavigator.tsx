import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ResourceListScreen from '../screens/ResourceListScreen';
import ResourceDetailScreen from '../screens/ResourceDetailScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import AddResourceScreen from '../screens/AddResourceScreen';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#f8fafc',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ResourceList"
        component={ResourceListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResourceDetail"
        component={ResourceDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="Recommendations"
        component={RecommendationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddResource"
        component={AddResourceScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}