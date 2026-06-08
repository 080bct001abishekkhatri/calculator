import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#333333',
        },
        tabBarActiveTintColor: '#cc6600',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color }) => (
            <Ionicons name="calculator" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cashflow"
        options={{
          title: 'Cash Flow',
          tabBarIcon: ({ color }) => (
            <Ionicons name="trending-up" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exit"
        options={{
          title: 'Exit',
          tabBarIcon: ({ color }) => (
            <Ionicons name="power" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}