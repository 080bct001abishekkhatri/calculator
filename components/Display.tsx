import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface DisplayProps {
  expression: string;
  result: number | null;
  shiftActive: boolean;
}

export default function Display({ expression, result, shiftActive }: DisplayProps) {
  return (
    <View style={s.container}>
      {/* Status bar */}
      <View style={s.statusBar}>
        <View style={s.statusLeft}>
          <Text style={s.statusChip}>NATURAL V.P.A.M.</Text>
          {shiftActive && <Text style={[s.statusChip, s.shiftChip]}>SHIFT</Text>}
        </View>
        <Text style={s.statusRight}>DEG · FIX</Text>
      </View>

      {/* Expression */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.exprScroll}
      >
        <Text style={s.expression} numberOfLines={1}>
          {expression || '0'}
        </Text>
      </ScrollView>

      {/* Divider */}
      {result !== null && <View style={s.divider} />}

      {/* Result */}
      {result !== null && (
        <Text style={s.result} numberOfLines={1}>
          = {result}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#0d1117',
    marginHorizontal: 8,
    marginTop: 6,
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#21262d',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusLeft: { flexDirection: 'row', gap: 6 },
  statusChip: {
    fontSize: 9,
    color: '#484f58',
    fontWeight: '700',
    letterSpacing: 0.5,
    backgroundColor: '#161b22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shiftChip: { color: '#ffaa22', backgroundColor: '#2a1f00' },
  statusRight: { color: '#484f58', fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  exprScroll: { alignItems: 'center', paddingVertical: 4 },
  expression: {
    fontSize: 28,
    color: '#c9d1d9',
    fontWeight: '300',
    letterSpacing: 1.5,
  },
  divider: { height: 1, backgroundColor: '#21262d', marginVertical: 6 },
  result: {
    fontSize: 22,
    color: '#cc6600',
    textAlign: 'right',
    fontWeight: '600',
  },
});