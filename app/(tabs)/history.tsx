import { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, StatusBar } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getHistory, clearHistory } from '../../utils/history';

export default function History() {
  const [items, setItems] = useState<any[]>([]);

  useFocusEffect(useCallback(()=>{ getHistory().then(setItems); },[]) );

  const handleClear = () =>
    Alert.alert('Clear History','Delete all saved calculations?',[
      {text:'Cancel',style:'cancel'},
      {text:'Clear',style:'destructive',onPress:()=>{clearHistory();setItems([]);}}
    ]);

  const renderItem = ({item}:{item:any}) => (
    <View style={s.item}>
      <Text style={s.expr}>{item.expression}</Text>
      <Text style={s.res}>= {item.result}</Text>
      <Text style={s.time}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={s.header}>
        <Text style={s.title}>Calculation History</Text>
        {items.length>0&&(
          <Pressable onPress={handleClear} style={s.clearBtn}>
            <Text style={s.clearText}>Clear All</Text>
          </Pressable>
        )}
      </View>
      {items.length===0
        ? <View style={s.empty}><Text style={s.emptyText}>No calculations yet.{'\n'}Start using the calculator!</Text></View>
        : <FlatList data={items} keyExtractor={i=>i.id} renderItem={renderItem} contentContainerStyle={{padding:8}} />
      }
    </View>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#0a0a0a', paddingTop:40 },
  header:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16 },
  title:    { color:'#cc6600', fontSize:16, fontWeight:'700', letterSpacing:1 },
  clearBtn: { backgroundColor:'#5a1a1a', paddingHorizontal:12, paddingVertical:6, borderRadius:6 },
  clearText:{ color:'#ff6666', fontSize:13 },
  item:     { backgroundColor:'#1a1a1a', borderRadius:8, padding:12, marginBottom:8, borderLeftWidth:3, borderLeftColor:'#cc6600' },
  expr:     { color:'#aaaaaa', fontSize:14 },
  res:      { color:'#ffffff', fontSize:18, fontWeight:'600', marginTop:2 },
  time:     { color:'#444', fontSize:11, marginTop:4 },
  empty:    { flex:1, justifyContent:'center', alignItems:'center' },
  emptyText:{ color:'#444', fontSize:15, textAlign:'center', lineHeight:24 },
});