import { Pressable, StyleSheet, Text } from 'react-native';

export default function CalcButton({ label, onPress, type = 'number', wide = false }: {
  label: string;
  onPress: () => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[type as keyof typeof styles] as any,
        wide && styles.wide,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, styles[`${type}Text` as keyof typeof styles] as any]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,           // fills available height in the row
    margin: 3,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,     // never collapse below this
  },
  wide:    { flex: 2 },
  pressed: { opacity: 0.6 },

  number:     { backgroundColor: '#2a2a2a' },
  operator:   { backgroundColor: '#cc6600' },
  scientific: { backgroundColor: '#1a3a3a' },
  special:    { backgroundColor: '#3a3a1a' },
  shift:      { backgroundColor: '#4a3a00' },
  clear:      { backgroundColor: '#5a1a1a' },
  equals:     { backgroundColor: '#cc6600' },

  numberText:     { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  operatorText:   { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  scientificText: { color: '#88dddd', fontSize: 13, fontWeight: '600' },
  specialText:    { color: '#dddd88', fontSize: 13, fontWeight: '600' },
  shiftText:      { color: '#ffcc44', fontSize: 13, fontWeight: '600' },
  clearText:      { color: '#ff6666', fontSize: 16, fontWeight: '600' },
  equalsText:     { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  label:          { fontSize: 16, fontWeight: '600' },
});