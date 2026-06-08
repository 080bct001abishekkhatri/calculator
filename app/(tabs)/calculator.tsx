import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const BUTTONS = [
  ['C', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function CalculatorScreen(): JSX.Element {
  const [display, setDisplay] = useState<string>('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<boolean>(false);

  const applyOp = (a: number, b: number, operator: string) => {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };

  const onPress = (value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setAcc(null);
      setOp(null);
      setWaiting(false);
      return;
    }
    if (value === '+/-') {
      setDisplay((d) => (d.startsWith('-') ? d.slice(1) : d === '0' ? d : '-' + d));
      return;
    }
    if (value === '%') {
      setDisplay((d) => String(parseFloat(d) / 100));
      return;
    }
    if (value === '+' || value === '-' || value === '×' || value === '÷') {
      const current = parseFloat(display);
      if (acc === null) {
        setAcc(current);
      } else if (op) {
        const result = applyOp(acc, current, op);
        setAcc(Number.isNaN(result) ? 0 : result);
        setDisplay(String(Number.isNaN(result) ? 'Error' : result));
      }
      setOp(value);
      setWaiting(true);
      return;
    }
    if (value === '=') {
      if (op && acc !== null) {
        const current = parseFloat(display);
        const result = applyOp(acc, current, op);
        setDisplay(String(Number.isNaN(result) ? 'Error' : result));
        setAcc(null);
        setOp(null);
        setWaiting(true);
      }
      return;
    }
    // Digit or dot
    if (waiting) {
      setDisplay(value === '.' ? '0.' : value);
      setWaiting(false);
    } else {
      setDisplay((d) => {
        if (value === '.' && d.includes('.')) return d;
        if (d === '0' && value !== '.') return value;
        return d + value;
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.displayContainer}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.displayText}>
          {display}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        {BUTTONS.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((b) => {
              const isZero = b === '0';
              const btnStyle = [
                styles.button,
                b === '=' ? styles.equalsButton : null,
                (b === '÷' || b === '×' || b === '+' || b === '-') ? styles.opButton : null,
                isZero ? styles.zeroButton : null,
              ];
              return (
                <TouchableOpacity
                  key={`${b}-${rIdx}`}
                  style={btnStyle}
                  onPress={() => onPress(b)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, b === '=' ? styles.equalsText : null]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end' },
  displayContainer: { padding: 24, minHeight: 140, justifyContent: 'center', alignItems: 'flex-end' },
  displayText: { color: '#fff', fontSize: 56, fontWeight: '600' },
  buttonsContainer: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  button: {
    flex: 1,
    marginHorizontal: 6,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zeroButton: { flex: 2, alignItems: 'flex-start', paddingLeft: 28 },
  buttonText: { color: '#fff', fontSize: 24 },
  opButton: { backgroundColor: '#ff9f0a' },
  equalsButton: { backgroundColor: '#ff9f0a' },
  equalsText: { color: '#000', fontWeight: '700' },
});
