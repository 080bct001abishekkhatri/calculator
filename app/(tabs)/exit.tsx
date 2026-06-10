import { Ionicons } from '@expo/vector-icons';
import { Alert, BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INFO = {
  name: 'Abishek Khatri',
  roll: 'JEC080BCT001',
  college: 'Janakpur Engineering College',
  university: 'Tribhuvan University — IOE',
  dept: 'B.E. Computer Engineering · Year III',
  course: 'ENCE 356 — Engineering Economics',
  appName: 'EconCalc',
  appSub: 'fx-991ES PLUS Edition',
  declaration: 'I declare that this application is my original and independent work. The ECON mode (Cash Flow Analyzer) is an original feature not present in the physical Casio fx-991ES PLUS.',
};

function Badge({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.badgeRow}>
      <Ionicons name={icon as any} size={15} color="#cc6600" style={s.badgeIcon} />
      <View style={{ flex: 1 }}>
        <Text style={s.badgeLabel}>{label}</Text>
        <Text style={s.badgeValue}>{value}</Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const handleExit = () => {
  Alert.alert(
    'Exit EconCalc',
    'Are you sure you want to exit?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
    ],
    { cancelable: true }
  );
};

export default function ExitScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── App Identity ── */}
        <View style={s.heroCard}>
          <View style={s.appIconRing}>
            <Ionicons name="calculator" size={38} color="#cc6600" />
          </View>
          <Text style={s.appName}>{INFO.appName}</Text>
          <Text style={s.appSub}>{INFO.appSub}</Text>
          <View style={s.tagRow}>
            {['React Native', 'Expo SDK 53', 'mathjs', 'TypeScript'].map(t => (
              <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>
            ))}
          </View>
        </View>

        {/* ── Author ── */}
        <Section title="AUTHOR">
          {/*
            PHOTO: replace the inner <View style={s.photoFill}> with:
            <Image source={require('../../assets/images/photo.jpg')} style={s.photoFill} />
          */}
          <View style={s.photoRow}>
            <View style={s.photoRing}>
              <Image source={require('../../assets/images/photo.jpg')} style={s.photoFill} />
            </View>
            <View style={s.photoInfo}>
              <Text style={s.authorName}>{INFO.name}</Text>
              <Text style={s.authorRoll}>{INFO.roll}</Text>
            </View>
          </View>
          <Badge icon="school-outline" label="College" value={INFO.college} />
          <Badge icon="library-outline" label="University" value={INFO.university} />
          <Badge icon="construct-outline" label="Programme" value={INFO.dept} />
          <Badge icon="book-outline" label="Course" value={INFO.course} />
        </Section>

        {/* ── Original Feature ── */}
        <Section title="ORIGINAL FEATURE">
          <View style={s.featureCard}>
            <View style={s.featureHeader}>
              <Ionicons name="star" size={16} color="#cc6600" />
              <Text style={s.featureName}>  ECON MODE — Cash Flow Analyzer</Text>
            </View>
            <Text style={s.featureDesc}>
              Solves a core limitation of the physical Casio fx-991ES PLUS: it cannot compute
              NPV, Future Worth, or Annual Worth from real multi-period cash flows, and requires
              manual lookup from printed factor tables.
            </Text>
            <View style={s.divider} />
            {[
              'NPV — Net Present Value from variable cash flows',
              'FW  — Future Worth at end of project life',
              'AW  — Annual Worth (annualized equivalent)',
              'All 6 TVM factors: P/F, F/P, P/A, A/P, F/A, A/F',
              'Visual cash flow timeline diagram',
              'Auto ACCEPT / REJECT decision based on NPV',
            ].map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>›</Text>
                <Text style={s.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Tech Stack ── */}
        <Section title="TECH STACK">
          <View style={s.stackGrid}>
            {[
              { icon: 'logo-react', label: 'React Native' },
              { icon: 'phone-portrait', label: 'Expo SDK 53' },
              { icon: 'calculator', label: 'mathjs' },
              { icon: 'save', label: 'AsyncStorage' },
              { icon: 'git-branch', label: 'TypeScript' },
              { icon: 'navigate', label: 'Expo Router' },
            ].map(item => (
              <View key={item.label} style={s.stackItem}>
                <Ionicons name={item.icon as any} size={18} color="#cc6600" />
                <Text style={s.stackLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Declaration ── */}
        <Section title="DECLARATION OF AUTHORSHIP">
          <View style={s.declarationCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#cc6600" style={{ marginBottom: 8 }} />
            <Text style={s.declarationText}>"{INFO.declaration}"</Text>
            <View style={s.divider} />
            <Text style={s.signatureName}>{INFO.name}</Text>
            <Text style={s.signatureRoll}>{INFO.roll}</Text>
            <Text style={s.signatureCourse}>{INFO.course}</Text>
          </View>
        </Section>

        {/* ── Exit Button ── */}
        <Pressable
          style={({ pressed }) => [s.exitBtn, pressed && { opacity: 0.75 }]}
          onPress={handleExit}
        >
          <Ionicons name="power" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={s.exitBtnText}>EXIT ECONCALC</Text>
        </Pressable>

        <Text style={s.footer}>EconCalc · JEC · 2082 B.S.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  // Hero
  heroCard: { backgroundColor: '#111', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#1e1e1e' },
  appIconRing: { width: 70, height: 70, borderRadius: 20, backgroundColor: '#1a1a00', borderWidth: 2, borderColor: '#cc6600', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appName: { color: '#cc6600', fontSize: 24, fontWeight: '700', letterSpacing: 4 },
  appSub: { color: '#555', fontSize: 11, letterSpacing: 1, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { backgroundColor: '#1a2a1a', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: '#88cc88', fontSize: 10, fontWeight: '600' },

  // Section
  section: { backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e1e1e' },
  sectionTitle: { color: '#cc6600', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },

  // Author
  photoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  photoRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#cc6600', padding: 3, marginRight: 14, overflow: 'hidden' },
  photoFill: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#1a2a1a', justifyContent: 'center', alignItems: 'center' },
  photoInfo: { flex: 1 },
  authorName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  authorRoll: { color: '#cc6600', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: 3 },
  badgeRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  badgeIcon: { marginRight: 10, marginTop: 1 },
  badgeLabel: { color: '#444', fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  badgeValue: { color: '#bbb', fontSize: 12, marginTop: 1 },

  // Feature
  featureCard: { backgroundColor: '#0f1a0f', borderRadius: 8, padding: 14, borderLeftWidth: 3, borderLeftColor: '#cc6600' },
  featureHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureName: { color: '#cc6600', fontSize: 13, fontWeight: '700' },
  featureDesc: { color: '#999', fontSize: 12, lineHeight: 19 },
  bulletRow: { flexDirection: 'row', marginTop: 6 },
  bullet: { color: '#cc6600', fontSize: 13, fontWeight: '700', marginRight: 8, width: 10 },
  bulletText: { color: '#bbb', fontSize: 12, flex: 1, lineHeight: 18 },

  // Stack
  stackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stackItem: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, alignItems: 'center', width: '30%', gap: 5, borderWidth: 1, borderColor: '#222' },
  stackLabel: { color: '#888', fontSize: 10, textAlign: 'center' },

  // Declaration
  declarationCard: { backgroundColor: '#0f0f1f', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a4a' },
  declarationText: { color: '#888', fontSize: 12, lineHeight: 20, textAlign: 'center', fontStyle: 'italic' },
  signatureName: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 6 },
  signatureRoll: { color: '#cc6600', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  signatureCourse: { color: '#444', fontSize: 10, marginTop: 2 },

  // Exit button
  exitBtn: { flexDirection: 'row', backgroundColor: '#5a1a1a', borderRadius: 10, padding: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 12, borderWidth: 1, borderColor: '#8a2a2a' },
  exitBtnText: { color: '#ff6666', fontSize: 15, fontWeight: '700', letterSpacing: 2 },

  divider: { width: '100%', height: 1, backgroundColor: '#1e1e1e', marginVertical: 12 },
  footer: { color: '#222', fontSize: 10, textAlign: 'center' },
});