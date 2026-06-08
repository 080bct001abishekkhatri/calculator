import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface DisplayProps {
  expression: string;
  result: number | null;
  shiftActive: boolean;
}

export default function Display({ expression, result, shiftActive }: DisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.status}>NATURAL-V.P.A.M.</Text>
        <Text style={styles.status}>{shiftActive ? 'SHIFT' : '   '} | Deg | FIX</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exprScroll}
      >
        <Text style={styles.expression}>{expression || '0'}</Text>
      </ScrollView>
      <Text style={styles.result} numberOfLines={1}>
        {result !== null ? `= ${result}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#c8d8a0',
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 6,
    padding: 10,
    minHeight: 110,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#8aaa60',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 10,
    color: '#4a6a20',
    fontWeight: '600',
  },
  exprScroll: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  expression: {
    fontSize: 26,
    color: '#1a3a1a',
    fontWeight: '400',
    letterSpacing: 1,
  },
  result: {
    fontSize: 18,
    color: '#3a5a1a',
    textAlign: 'right',
  },
});