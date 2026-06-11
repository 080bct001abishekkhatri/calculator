import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#cc6600',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: { backgroundColor: '#111', borderTopColor: '#1e1e1e' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color }) => <Ionicons name="calculator" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cashflow"
        options={{
          title: 'Cash Flow',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exit"
        options={{
          title: 'Exit',
          tabBarIcon: ({ color }) => <Ionicons name="exit-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}