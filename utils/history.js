import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'calc_history';

export const saveToHistory = async (expression, result) => {
  try {
    const existing = await getHistory();
    const entry = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date().toLocaleString(),
    };
    const updated = [entry, ...existing].slice(0, 50);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {}
};

export const getHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {}
};