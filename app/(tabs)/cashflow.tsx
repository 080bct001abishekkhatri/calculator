import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import {
  computeAW,
  computeFactors,
  computeFW,
  computeIRR,
  computeNPV,
  computePayback
} from '../../utils/cashflow';

/* ---------------- Factor Row Component ---------------- */
function FactorRow({ label, val }: { label: string; val: number }) {
  const safeVal = typeof val === 'number' && !isNaN(val) ? val : 0;

  return (
    <View style={s.factorRow}>
      <Text style={s.factorLabel}>{label}</Text>
      <Text style={s.factorVal}>{safeVal.toFixed(6)}</Text>
    </View>
  );
}

/* ---------------- Main Component ---------------- */
export default function CashFlow() {
  const [rate, setRate] = useState('');
  const [periods, setPeriods] = useState('');
  const [cfs, setCfs] = useState<{ period: number; amount: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  const [newCF, setNewCF] = useState('');

  const addPeriod = () => {
    const n = cfs.length + 1;
    const limit = parseInt(periods) || 20;

    if (n > limit) {
      Alert.alert('Limit', 'All periods already added.');
      return;
    }

    setCfs(prev => [...prev, { period: n, amount: newCF || '0' }]);
    setNewCF('');
  };

  const updateCF = (idx: number, val: string) => {
    const updated = [...cfs];
    updated[idx] = { ...updated[idx], amount: val };
    setCfs(updated);
  };

  const removeLast = () => setCfs(prev => prev.slice(0, -1));

  const calculate = () => {
    const i = parseFloat(rate) / 100;
    const n = parseInt(periods);

    if (isNaN(i) || isNaN(n) || i < 0 || n <= 0) {
      Alert.alert('Invalid Input', 'Enter valid interest rate and number of periods.');
      return;
    }

    const cashflows = cfs.map(c => parseFloat(c.amount) || 0);

    while (cashflows.length < n + 1) {
      cashflows.push(0);
    }

    const factors = computeFactors(i, n);
    const npv = computeNPV(i, cashflows);
    const fw = computeFW(npv, i, n);
    const aw = computeAW(npv, factors.AP);

    const irr = computeIRR(cashflows);
    const payback = computePayback(cashflows);

    setResult({
      factors,
      npv,
      fw,
      aw,
      irr,
      payback,
      i,
      n,
      cashflows,
    });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>ECON MODE</Text>
        <Text style={s.subtitle}>Cash Flow Analyzer — Engineering Economics</Text>
        <Text style={s.note}>Replaces manual factor-table lookup</Text>
      </View>

      {/* Inputs */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>PARAMETERS</Text>

        <View style={s.inputRow}>
          <Text style={s.inputLabel}>Interest Rate (%)</Text>
          <TextInput
            style={s.input}
            keyboardType="numeric"
            value={rate}
            onChangeText={setRate}
            placeholder="e.g. 10"
            placeholderTextColor="#555"
          />
        </View>

        <View style={s.inputRow}>
          <Text style={s.inputLabel}>No. of Periods (n)</Text>
          <TextInput
            style={s.input}
            keyboardType="numeric"
            value={periods}
            onChangeText={setPeriods}
            placeholder="e.g. 5"
            placeholderTextColor="#555"
          />
        </View>
      </View>

      {/* Cashflows */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>CASH FLOWS</Text>

        {cfs.map((cf, i) => (
          <View key={i} style={s.cfRow}>
            <Text style={s.cfPeriod}>t={cf.period - 1}</Text>

            <TextInput
              style={[s.input, { flex: 1 }]}
              keyboardType="numeric"
              value={cf.amount}
              onChangeText={v => updateCF(i, v)}
            />

            <Text
              style={[
                s.cfArrow,
                parseFloat(cf.amount) >= 0 ? s.inflow : s.outflow
              ]}
            >
              {parseFloat(cf.amount) >= 0 ? '↑' : '↓'}
            </Text>
          </View>
        ))}

        <View style={s.cfActions}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            keyboardType="numeric"
            value={newCF}
            onChangeText={setNewCF}
            placeholder={`CF for period ${cfs.length}`}
            placeholderTextColor="#555"
          />

          <Pressable style={s.btnAdd} onPress={addPeriod}>
            <Text style={s.btnText}>+ ADD</Text>
          </Pressable>

          {cfs.length > 0 && (
            <Pressable style={s.btnRemove} onPress={removeLast}>
              <Text style={s.btnText}>DEL</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Calculate */}
      <Pressable style={s.calcBtn} onPress={calculate}>
        <Text style={s.calcBtnText}>CALCULATE →</Text>
      </Pressable>

      {/* Results */}
      {result && (
        <>
          <View style={s.resultSection}>
            <Text style={s.sectionTitle}>
              RESULTS (i = {(result.i * 100).toFixed(2)}%, n = {result.n})
            </Text>

            {[
              ['NPV', result.npv],
              ['FW', result.fw],
              ['AW', result.aw],
              ['IRR', result.irr ?? 0],
              ['Payback', result.payback ?? 0],
            ].map(([label, val]) => {
              const num = typeof val === 'number' ? val : Number(val);

              return (
                <View key={label} style={s.mainResultRow}>
                  <Text style={s.mainResultLabel}>{label}</Text>
                  <Text
                    style={[
                      s.mainResultVal,
                      num >= 0 ? s.positive : s.negative
                    ]}
                  >
                    {num.toFixed(4)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Factor Table */}
          <View style={s.resultSection}>
            <Text style={s.sectionTitle}>FACTOR TABLE</Text>

            <FactorRow label="P/F" val={result.factors.PF} />
            <FactorRow label="F/P" val={result.factors.FP} />
            <FactorRow label="P/A" val={result.factors.PA} />
            <FactorRow label="A/P" val={result.factors.AP} />
            <FactorRow label="F/A" val={result.factors.FA} />
            <FactorRow label="A/F" val={result.factors.AF} />
          </View>

          {/* Decision */}
          <View
            style={[
              s.resultSection,
              { backgroundColor: result.npv >= 0 ? '#1a3a1a' : '#3a1a1a' }
            ]}
          >
            <Text style={s.sectionTitle}>DECISION</Text>

            <Text style={{ color: result.npv >= 0 ? '#88ff88' : '#ff8888' }}>
              {result.npv >= 0
                ? 'ACCEPT project (NPV ≥ 0)'
                : 'REJECT project (NPV < 0)'}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  header: {
    backgroundColor: '#1a1a00',
    padding: 16,
    margin: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#cc6600'
  },

  title: { color: '#cc6600', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#fff', fontSize: 13 },
  note: { color: '#888', fontSize: 11, fontStyle: 'italic' },

  section: {
    margin: 12,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8
  },

  sectionTitle: {
    color: '#cc6600',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10
  },

  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },

  inputLabel: { color: '#aaa', width: 160 },

  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    padding: 8,
    borderRadius: 4
  },

  cfRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },

  cfPeriod: { color: '#cc6600', width: 40 },

  cfArrow: { width: 20, fontSize: 18, textAlign: 'center' },

  inflow: { color: '#44ff88' },
  outflow: { color: '#ff5555' },

  cfActions: { flexDirection: 'row', gap: 6, marginTop: 8 },

  btnAdd: {
    backgroundColor: '#1a3a1a',
    padding: 8,
    borderRadius: 4
  },

  btnRemove: {
    backgroundColor: '#3a1a1a',
    padding: 8,
    borderRadius: 4
  },

  btnText: { color: '#fff' },

  calcBtn: {
    backgroundColor: '#cc6600',
    margin: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },

  calcBtnText: { color: '#fff', fontWeight: '700' },

  resultSection: {
    margin: 12,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8
  },

  mainResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },

  mainResultLabel: { color: '#aaa' },

  mainResultVal: { fontWeight: '700' },

  positive: { color: '#44ff88' },
  negative: { color: '#ff5555' },

  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },

  factorLabel: { color: '#ccc' },

  factorVal: { color: '#c8d8a0', fontWeight: '600' }
});