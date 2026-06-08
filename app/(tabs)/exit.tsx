import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function RootLayout() {
    const [ready, setReady] = useState(false);
    const opacity = new Animated.Value(1);

    useEffect(() => {
        const t = setTimeout(() => {
            Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => setReady(true));
        }, 3000);
        return () => clearTimeout(t);
    }, []);

    if (!ready) {
        return (
            <Animated.View style={[splash.container, { opacity }]}>
                {/* Replace the View below with Image once you add your photo */}
                <View style={splash.photoRing}>
                    <View style={[splash.photo, splash.placeholder]}>
                        <Text style={splash.placeholderText}>YOUR{'\n'}PHOTO</Text>
                    </View>
                </View>
                <Text style={splash.appName}>EconCalc</Text>
                <Text style={splash.appSub}>fx-991ES PLUS Edition</Text>
                <View style={splash.divider} />
                <Text style={splash.name}>Abishek [Your Surname]</Text>
                <Text style={splash.roll}>Roll No: [XXX-BCT-XXX]</Text>
                <Text style={splash.college}>Janakpur Engineering College, TU</Text>
                <Text style={splash.dept}>B.E. Computer Engineering · Year III</Text>
                <View style={splash.divider} />
                <Text style={splash.declaration}>
                    "I declare that this application is{'\n'}my original and independent work."
                </Text>
                <Text style={splash.course}>ENCE 356 — Engineering Economics</Text>
            </Animated.View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}

const splash = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 28 },
    photoRing: { borderWidth: 3, borderColor: '#cc6600', borderRadius: 54, padding: 3, marginBottom: 20 },
    photo: { width: 96, height: 96, borderRadius: 48 },
    placeholder: { backgroundColor: '#1a2a1a', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#cc6600', fontSize: 10, textAlign: 'center' },
    appName: { color: '#cc6600', fontSize: 28, fontWeight: '700', letterSpacing: 4 },
    appSub: { color: '#888', fontSize: 12, letterSpacing: 1, marginTop: 2 },
    divider: { width: '70%', height: 1, backgroundColor: '#333', marginVertical: 18 },
    name: { color: '#ffffff', fontSize: 21, fontWeight: '700' },
    roll: { color: '#aaa', fontSize: 13, marginTop: 4 },
    college: { color: '#888', fontSize: 12, marginTop: 4 },
    dept: { color: '#666', fontSize: 11, marginTop: 2 },
    declaration: { color: '#cc6600', fontSize: 13, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 },
    course: { color: '#555', fontSize: 11, marginTop: 12 },
});