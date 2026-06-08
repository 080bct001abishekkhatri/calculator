import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable,
  StyleSheet, StatusBar, Alert
} from 'react-native';
import { computeFactors, computeNPV, computeFW, computeAW } from '../../utils/cashflow';

export default function CashFlow() {
  const [rate,    setRate]    = useState('');
  const [periods, setPeriods] = useState('');
  const [cfs,     setCfs]     = useState<{period:number,amount:string}[]>([]);
  const [result,  setResult]  = useState<any>(null);
  const [newCF,   setNewCF]   = useState('');

  const addPeriod = () => {
    const n = cfs.length + 1;
    const limit = parseInt(periods)||20;
    if (n > limit) { Alert.alert('Limit','All periods already added.'); return; }
    setCfs(p=>[...p,{period:n, amount:newCF||'0'}]);
    setNewCF('');
  };

  const updateCF = (idx:number, val:string) => {
    const updated = [...cfs];
    updated[idx].amount = val;
    setCfs(updated);
  };

  const removeLast = () => setCfs(p=>p.slice(0,-1));

  const calculate = () => {
    const i = parseFloat(rate)/100;
    const n = parseInt(periods);
    if (isNaN(i)||isNaN(n)||i<0||n<=0) { Alert.alert('Invalid Input','Enter valid interest rate and number of periods.'); return; }
    const cashflows = cfs.map(c=>parseFloat(c.amount)||0);
    while (cashflows.length < n+1) cashflows.push(0); // ensure period 0 through n
    const factors = computeFactors(i, n);
    const npv     = computeNPV(i, cashflows);
    const fw      = computeFW(npv, i, n);
    const aw      = computeAW(npv, factors.AP);
    setResult({ factors, npv, fw, aw, i, n, cashflows });
  };

  const FactorRow = ({label,val}:{label:string,val:number}) => (
    <View style={s.factorRow}>
      <Text style={s.factorLabel}>{label}</Text>
      <Text style={s.factorVal}>{val.toFixed(6)}</Text>
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{paddingBottom:40}}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>ECON MODE</Text>
        <Text style={s.subtitle}>Cash Flow Analyzer — Engineering Economics</Text>
        <Text style={s.note}>Replaces manual factor-table lookup from ENCE 356 textbook appendix</Text>
      </View>

      {/* Inputs */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>PARAMETERS</Text>
        <View style={s.inputRow}>
          <Text style={s.inputLabel}>Interest Rate (%)</Text>
          <TextInput style={s.input} keyboardType="numeric" value={rate}
            onChangeText={setRate} placeholder="e.g. 10" placeholderTextColor="#555" />
        </View>
        <View style={s.inputRow}>
          <Text style={s.inputLabel}>No. of Periods (n)</Text>
          <TextInput style={s.input} keyboardType="numeric" value={periods}
            onChangeText={setPeriods} placeholder="e.g. 5" placeholderTextColor="#555" />
        </View>
      </View>

      {/* Cash Flow Entry */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>CASH FLOWS  (+ inflow  /  − outflow)</Text>
        <Text style={s.hint}>Period 0 = initial investment (usually negative)</Text>
        {cfs.map((cf,i)=>(
          <View key={i} style={s.cfRow}>
            <Text style={s.cfPeriod}>t={cf.period-1}</Text>
            <TextInput style={[s.input,{flex:1}]} keyboardType="numeric" value={cf.amount}
              onChangeText={v=>updateCF(i,v)} placeholder="0" placeholderTextColor="#555" />
            <Text style={[s.cfArrow, parseFloat(cf.amount)>=0?s.inflow:s.outflow]}>
              {parseFloat(cf.amount)>=0?'↑':'↓'}
            </Text>
          </View>
        ))}
        <View style={s.cfActions}>
          <TextInput style={[s.input,{flex:1}]} keyboardType="numeric" value={newCF}
            onChangeText={setNewCF} placeholder={`CF for period ${cfs.length}`} placeholderTextColor="#555" />
          <Pressable style={s.btnAdd} onPress={addPeriod}><Text style={s.btnText}>+ ADD</Text></Pressable>
          {cfs.length>0&&<Pressable style={s.btnRemove} onPress={removeLast}><Text style={s.btnText}>DEL</Text></Pressable>}
        </View>
      </View>

      {/* Calculate */}
      <Pressable style={s.calcBtn} onPress={calculate}>
        <Text style={s.calcBtnText}>CALCULATE  →</Text>
      </Pressable>

      {/* Results */}
      {result && (
        <>
          {/* Main results */}
          <View style={s.resultSection}>
            <Text style={s.sectionTitle}>RESULTS  (i = {(result.i*100).toFixed(2)}%,  n = {result.n})</Text>
            {[
              ['NPV  (Net Present Value)',  result.npv],
              ['FW   (Future Worth)',       result.fw],
              ['AW   (Annual Worth)',       result.aw],
            ].map(([label,val])=>(
              <View key={String(label)} style={s.mainResultRow}>
                <Text style={s.mainResultLabel}>{String(label)}</Text>
                <Text style={[s.mainResultVal, (val as number)<0?s.negative:s.positive]}>
                  {(val as number).toFixed(4)}
                </Text>
              </View>
            ))}
          </View>

          {/* Factor Table */}
          <View style={s.resultSection}>
            <Text style={s.sectionTitle}>FACTOR TABLE  (i={((result.i)*100).toFixed(2)}%, n={result.n})</Text>
            <Text style={s.hint}>These replace Appendix A in your ENCE 356 textbook</Text>
            <View style={s.factorHeader}>
              <Text style={[s.factorLabel,{color:'#cc6600',fontWeight:'700'}]}>Factor</Text>
              <Text style={[s.factorVal,{color:'#cc6600',fontWeight:'700'}]}>Value</Text>
            </View>
            <FactorRow label="P/F  (P given F)"  val={result.factors.PF} />
            <FactorRow label="F/P  (F given P)"  val={result.factors.FP} />
            <FactorRow label="P/A  (P given A)"  val={result.factors.PA} />
            <FactorRow label="A/P  (A given P)"  val={result.factors.AP} />
            <FactorRow label="F/A  (F given A)"  val={result.factors.FA} />
            <FactorRow label="A/F  (A given F)"  val={result.factors.AF} />
          </View>

          {/* Cash Flow Timeline */}
          <View style={s.resultSection}>
            <Text style={s.sectionTitle}>CASH FLOW TIMELINE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.timeline}>
                <View style={s.timelineBar} />
                {result.cashflows.map((cf:number,t:number)=>(
                  <View key={t} style={[s.timelineItem, {left: t*60}]}>
                    <Text style={[s.timelineAmt, cf>=0?s.inflow:s.outflow]}>
                      {cf>=0?'↑':'↓'}{Math.abs(cf).toFixed(0)}
                    </Text>
                    <View style={[s.timelineTick, cf>=0?s.tickAbove:s.tickBelow]} />
                    <Text style={s.timelinePeriod}>t{t}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Interpretation */}
          <View style={[s.resultSection,{backgroundColor:result.npv>=0?'#1a3a1a':'#3a1a1a'}]}>
            <Text style={s.sectionTitle}>DECISION</Text>
            <Text style={{color:result.npv>=0?'#88ff88':'#ff8888',fontSize:15,fontWeight:'600'}}>
              {result.npv>=0
                ? `NPV = ${result.npv.toFixed(2)} ≥ 0 → ACCEPT the project (profitable)`
                : `NPV = ${result.npv.toFixed(2)} < 0 → REJECT the project (not profitable)`}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:       { flex:1, backgroundColor:'#0a0a0a' },
  header:          { backgroundColor:'#1a1a00', padding:16, margin:12, borderRadius:8, borderLeftWidth:3, borderLeftColor:'#cc6600' },
  title:           { color:'#cc6600', fontSize:16, fontWeight:'700', letterSpacing:2 },
  subtitle:        { color:'#ffffff', fontSize:13, marginTop:2 },
  note:            { color:'#888', fontSize:11, marginTop:4, fontStyle:'italic' },
  section:         { margin:12, backgroundColor:'#111', borderRadius:8, padding:12 },
  sectionTitle:    { color:'#cc6600', fontSize:12, fontWeight:'700', letterSpacing:1, marginBottom:10 },
  inputRow:        { flexDirection:'row', alignItems:'center', marginBottom:8 },
  inputLabel:      { color:'#aaa', fontSize:13, width:160 },
  input:           { backgroundColor:'#1a1a1a', color:'#fff', borderWidth:1, borderColor:'#333', borderRadius:4, padding:8, fontSize:15, marginLeft:4 },
  hint:            { color:'#555', fontSize:11, marginBottom:8, fontStyle:'italic' },
  cfRow:           { flexDirection:'row', alignItems:'center', marginBottom:6 },
  cfPeriod:        { color:'#cc6600', width:40, fontSize:13, fontWeight:'700' },
  cfArrow:         { width:24, fontSize:18, fontWeight:'700', textAlign:'center' },
  inflow:          { color:'#44ff88' },
  outflow:         { color:'#ff5555' },
  cfActions:       { flexDirection:'row', alignItems:'center', marginTop:8, gap:6 },
  btnAdd:          { backgroundColor:'#1a3a1a', paddingHorizontal:12, paddingVertical:8, borderRadius:4 },
  btnRemove:       { backgroundColor:'#3a1a1a', paddingHorizontal:12, paddingVertical:8, borderRadius:4 },
  btnText:         { color:'#fff', fontSize:13, fontWeight:'600' },
  calcBtn:         { backgroundColor:'#cc6600', marginHorizontal:12, marginVertical:8, padding:14, borderRadius:8, alignItems:'center' },
  calcBtnText:     { color:'#fff', fontSize:16, fontWeight:'700', letterSpacing:1 },
  resultSection:   { margin:12, backgroundColor:'#111', borderRadius:8, padding:12 },
  mainResultRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#222' },
  mainResultLabel: { color:'#aaa', fontSize:13 },
  mainResultVal:   { fontSize:16, fontWeight:'700' },
  positive:        { color:'#44ff88' },
  negative:        { color:'#ff5555' },
  factorHeader:    { flexDirection:'row', justifyContent:'space-between', paddingBottom:4, borderBottomWidth:1, borderBottomColor:'#333', marginBottom:4 },
  factorRow:       { flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomWidth:1, borderBottomColor:'#1a1a1a' },
  factorLabel:     { color:'#cccccc', fontSize:13 },
  factorVal:       { color:'#c8d8a0', fontSize:13, fontWeight:'600' },
  timeline:        { height:100, position:'relative', width:800, marginVertical:16 },
  timelineBar:     { position:'absolute', top:50, left:0, right:0, height:2, backgroundColor:'#444' },
  timelineItem:    { position:'absolute', top:0, alignItems:'center', width:50 },
  timelineAmt:     { fontSize:11, fontWeight:'700' },
  timelineTick:    { width:2, backgroundColor:'#666' },
  tickAbove:       { height:24 },
  tickBelow:       { height:24 },
  timelinePeriod:  { color:'#888', fontSize:10, marginTop:26 },
});