import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CalcButton({ label, onPress, type = 'number', wide = false }: {
  label: string;
  onPress: () => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.button,
        s[type as keyof typeof s] as any,
        wide && s.wide,
        pressed && s.pressed,
      ]}
      onPress={onPress}
    >
      <View style={s.inner}>
        <Text style={[s.label, s[`${type}Text` as keyof typeof s] as any]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    flex: 1,
    margin: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  inner:   { alignItems: 'center', justifyContent: 'center' },
  wide:    { flex: 2 },
  pressed: { opacity: 0.55, transform: [{ scale: 0.96 }] },

  // Button backgrounds
  number:     { backgroundColor: '#1e1e2e', borderWidth: 1, borderColor: '#2a2a3e' },
  operator:   { backgroundColor: '#cc6600', borderWidth: 1, borderColor: '#e07010' },
  scientific: { backgroundColor: '#162030', borderWidth: 1, borderColor: '#1e3040' },
  special:    { backgroundColor: '#222210', borderWidth: 1, borderColor: '#333320' },
  shift:      { backgroundColor: '#2a1f00', borderWidth: 1, borderColor: '#3a2f00' },
  clear:      { backgroundColor: '#2a0808', borderWidth: 1, borderColor: '#3a1010' },
  equals:     { backgroundColor: '#cc6600', borderWidth: 1, borderColor: '#e07010' },

  // Text colors
  label:          { fontSize: 15, fontWeight: '600' },
  numberText:     { color: '#e8e8f0', fontSize: 17, fontWeight: '500' },
  operatorText:   { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  scientificText: { color: '#66cccc', fontSize: 12, fontWeight: '600' },
  specialText:    { color: '#cccc66', fontSize: 12, fontWeight: '600' },
  shiftText:      { color: '#ffaa22', fontSize: 12, fontWeight: '700' },
  clearText:      { color: '#ff5555', fontSize: 16, fontWeight: '700' },
  equalsText:     { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});