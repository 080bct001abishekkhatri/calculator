import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const HOLD_MS = 3200;
const FADE_MS = 500;

const INFO = {
  name:       'Abishek Khatri',
  roll:       'JEC080BCT001',
  college:    'Janakpur Engineering College',
  university: 'Tribhuvan University — IOE',
  dept:       'B.E. Computer Engineering · Year III',
  course:     'ENCE 356 — Engineering Economics',
};

// Change this to true once you add assets/images/photo.jpg
const HAS_PHOTO = true;

function StartupSplash({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.93)).current;
  const logoRot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease),      useNativeDriver: true }),
      Animated.timing(scale,   { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.3)), useNativeDriver: true }),
      Animated.timing(logoRot, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease),      useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: FADE_MS, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale,   { toValue: 0.97, duration: FADE_MS, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start(() => onDone());
    }, HOLD_MS);

    return () => clearTimeout(t);
  }, []);

  const spin = logoRot.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '0deg'] });

  return (
    <Animated.View style={[sp.screen, { opacity }]}>
      <SafeAreaView style={sp.safe} edges={['top', 'bottom']}>
        <Animated.View style={[sp.card, { transform: [{ scale }] }]}>

          {/* ── Logo ── */}
          <Animated.View style={[sp.logoRing, { transform: [{ rotate: spin }] }]}>
            <Ionicons name="calculator" size={36} color="#cc6600" />
          </Animated.View>
          <Text style={sp.appName}>EconCalc</Text>
          <Text style={sp.appSub}>fx-991ES PLUS Edition</Text>

          <View style={sp.divider} />

          {/* ── Author block ── */}
          <View style={sp.authorRow}>
            {/* Photo: flip HAS_PHOTO to true after adding assets/images/photo.jpg */}
            <View style={sp.photoRing}>
              {HAS_PHOTO
                ? <Image source={require('../assets/images/photo.jpg')} style={sp.photoFill} />
                : <View style={sp.photoFill}><Ionicons name="person" size={30} color="#cc6600" /></View>
              }
            </View>
            <View style={sp.authorInfo}>
              <Text style={sp.authorName}>{INFO.name}</Text>
              <Text style={sp.rollNo}>{INFO.roll}</Text>
              <Text style={sp.college}>{INFO.college}</Text>
              <Text style={sp.university}>{INFO.university}</Text>
            </View>
          </View>

          <View style={sp.divider} />

          {/* ── Programme & course ── */}
          <View style={sp.metaRow}>
            <Ionicons name="construct-outline" size={12} color="#cc6600" />
            <Text style={sp.metaText}>{INFO.dept}</Text>
          </View>
          <View style={[sp.metaRow, { marginTop: 5 }]}>
            <Ionicons name="book-outline" size={12} color="#cc6600" />
            <Text style={sp.metaText}>{INFO.course}</Text>
          </View>

          <View style={sp.divider} />

          {/* ── Declaration ── */}
          <View style={sp.declarationBox}>
            <Ionicons name="shield-checkmark-outline" size={15} color="#cc6600" style={{ marginBottom: 5 }} />
            <Text style={sp.declarationText}>
              "I declare that this application is my original{'\n'}and independent work."
            </Text>
          </View>

          <Text style={sp.footer}>Mini Project · 2082 B.S.</Text>

        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        {!splashDone && <StartupSplash onDone={() => setSplashDone(true)} />}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const sp = StyleSheet.create({
  screen:          { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0a0a', zIndex: 1000, justifyContent: 'center' },
  safe:            { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  card:            { backgroundColor: '#111', borderRadius: 16, padding: 22, borderWidth: 1, borderColor: '#1e1e1e' },
  logoRing:        { width: 68, height: 68, borderRadius: 18, backgroundColor: '#1a1a00', borderWidth: 2, borderColor: '#cc6600', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 10 },
  appName:         { color: '#cc6600', fontSize: 26, fontWeight: '700', letterSpacing: 4, textAlign: 'center' },
  appSub:          { color: '#555', fontSize: 11, letterSpacing: 1, textAlign: 'center', marginTop: 2 },
  authorRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photoRing:       { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#cc6600', padding: 3, overflow: 'hidden' },
  photoFill:       { width: 74, height: 74, borderRadius: 37, backgroundColor: '#1a2a1a', justifyContent: 'center', alignItems: 'center' },
  authorInfo:      { flex: 1 },
  authorName:      { color: '#fff', fontSize: 16, fontWeight: '700' },
  rollNo:          { color: '#cc6600', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  college:         { color: '#999', fontSize: 11, marginTop: 3 },
  university:      { color: '#666', fontSize: 10, marginTop: 1 },
  metaRow:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:        { color: '#888', fontSize: 11 },
  declarationBox:  { backgroundColor: '#0f0f1f', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a4a' },
  declarationText: { color: '#777', fontSize: 12, lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },
  divider:         { height: 1, backgroundColor: '#1e1e1e', marginVertical: 13 },
  footer:          { color: '#2a2a2a', fontSize: 10, textAlign: 'center', marginTop: 12 },
});