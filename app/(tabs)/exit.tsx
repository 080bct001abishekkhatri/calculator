import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={s.badgeRow} accessibilityLabel={`${label}: ${value}`}>
      <Ionicons name={icon as any} size={16} color="#cc6600" style={s.badgeIcon} />
      <View>
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
          <View style={s.appIconRing} accessibilityLabel="EconCalc app icon">
            <Ionicons name="calculator" size={40} color="#cc6600" />
          </View>
          <Text style={s.appName}>{INFO.appName}</Text>
          <Text style={s.appSub}>{INFO.appSub}</Text>
          <View style={s.tagRow}>
            <View style={s.tag}><Text style={s.tagText}>React Native</Text></View>
            <View style={s.tag}><Text style={s.tagText}>Expo SDK 53</Text></View>
            <View style={s.tag}><Text style={s.tagText}>mathjs</Text></View>
          </View>
        </View>

        {/* ── Author ── */}
        <Section title="AUTHOR">
          {/* Photo placeholder — replace <View> with <Image source={...}> when ready */}
          <View style={s.photoRow}>
            <View style={s.photoRing} accessibilityLabel="Author photo placeholder">
              <View style={s.photoPlaceholder}>
                <Ionicons name="person" size={36} color="#cc6600" />
              </View>
            </View>
            <View style={s.photoInfo}>
              <Text style={s.authorName}>{INFO.name}</Text>
              <Text style={s.authorRoll}>{INFO.roll}</Text>
            </View>
          </View>
          <Badge icon="school-outline"     label="College"    value={INFO.college} />
          <Badge icon="library-outline"    label="University" value={INFO.university} />
          <Badge icon="construct-outline"  label="Programme"  value={INFO.dept} />
          <Badge icon="book-outline"       label="Course"     value={INFO.course} />
        </Section>

        {/* ── Original Feature ── */}
        <Section title="ORIGINAL FEATURE">
          <View style={s.featureCard}>
            <View style={s.featureHeader}>
              <Ionicons name="star" size={18} color="#cc6600" />
              <Text style={s.featureName}>  ECON MODE — Cash Flow Analyzer</Text>
            </View>
            <Text style={s.featureDesc}>
              Solves a core limitation of the physical Casio fx-991ES PLUS: it cannot compute
              NPV, Future Worth, or Annual Worth from real multi-period cash flows, and requires
              manual lookup from printed factor tables.
            </Text>
            <View style={s.divider} />
            <Text style={s.featureCaption}>What ECON Mode adds:</Text>
            {[
              'NPV — Net Present Value from variable cash flows',
              'FW  — Future Worth at end of project life',
              'AW  — Annual Worth (annualized equivalent)',
              'All 6 TVM factors: P/F, F/P, P/A, A/P, F/A, A/F',
              'Visual cash flow timeline diagram',
              'Auto decision: ACCEPT / REJECT based on NPV',
            ].map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>›</Text>
                <Text style={s.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Declaration ── */}
        <Section title="DECLARATION OF AUTHORSHIP">
          <View style={s.declarationCard}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#cc6600" style={{ marginBottom: 10 }} />
            <Text style={s.declarationText}>"{INFO.declaration}"</Text>
            <View style={s.divider} />
            <Text style={s.signatureName}>{INFO.name}</Text>
            <Text style={s.signatureRoll}>{INFO.roll}</Text>
            <Text style={s.signatureCourse}>{INFO.course}</Text>
          </View>
        </Section>

        {/* ── Tech Stack ── */}
        <Section title="TECH STACK">
          <View style={s.stackGrid}>
            {[
              { icon: 'logo-react',     label: 'React Native' },
              { icon: 'phone-portrait', label: 'Expo SDK 53' },
              { icon: 'calculator',     label: 'mathjs' },
              { icon: 'save',           label: 'AsyncStorage' },
              { icon: 'git-branch',     label: 'TypeScript' },
              { icon: 'navigate',       label: 'Expo Router' },
            ].map((item) => (
              <View key={item.label} style={s.stackItem}>
                <Ionicons name={item.icon as any} size={20} color="#cc6600" />
                <Text style={s.stackLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Text style={s.footer}>EconCalc · JEC · 2082 B.S.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#0a0a0a' },
  container:         { flex: 1 },
  content:           { padding: 16, paddingBottom: 40 },

  // Hero
  heroCard:          { backgroundColor: '#111', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  appIconRing:       { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#cc6600', backgroundColor: '#1a1a00', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  appName:           { color: '#cc6600', fontSize: 24, fontWeight: '700', letterSpacing: 3 },
  appSub:            { color: '#888', fontSize: 12, letterSpacing: 1, marginTop: 2 },
  tagRow:            { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  tag:               { backgroundColor: '#1a2a1a', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:           { color: '#88cc88', fontSize: 11, fontWeight: '600' },

  // Section
  section:           { backgroundColor: '#111', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e1e1e' },
  sectionTitle:      { color: '#cc6600', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 14 },

  // Author
  photoRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  photoRing:         { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#cc6600', padding: 3, marginRight: 14 },
  photoPlaceholder:  { flex: 1, borderRadius: 33, backgroundColor: '#1a2a1a', justifyContent: 'center', alignItems: 'center' },
  photoInfo:         { flex: 1 },
  authorName:        { color: '#fff', fontSize: 18, fontWeight: '700' },
  authorRoll:        { color: '#cc6600', fontSize: 13, fontWeight: '600', marginTop: 2, letterSpacing: 1 },

  badgeRow:          { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  badgeIcon:         { marginRight: 10, marginTop: 2 },
  badgeLabel:        { color: '#555', fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  badgeValue:        { color: '#ccc', fontSize: 13, marginTop: 1 },

  // Feature
  featureCard:       { backgroundColor: '#0f1f0f', borderRadius: 8, padding: 14, borderLeftWidth: 3, borderLeftColor: '#cc6600' },
  featureHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureName:       { color: '#cc6600', fontSize: 14, fontWeight: '700' },
  featureDesc:       { color: '#aaa', fontSize: 13, lineHeight: 20 },
  featureCaption:    { color: '#888', fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  bulletRow:         { flexDirection: 'row', marginBottom: 5 },
  bullet:            { color: '#cc6600', fontSize: 14, fontWeight: '700', marginRight: 8, width: 12 },
  bulletText:        { color: '#ccc', fontSize: 13, flex: 1, lineHeight: 19 },

  // Declaration
  declarationCard:   { backgroundColor: '#0f0f1f', borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a4a' },
  declarationText:   { color: '#aaa', fontSize: 13, lineHeight: 21, textAlign: 'center', fontStyle: 'italic' },
  signatureName:     { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 8 },
  signatureRoll:     { color: '#cc6600', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  signatureCourse:   { color: '#555', fontSize: 11, marginTop: 2 },

  // Stack
  stackGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stackItem:         { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, alignItems: 'center', width: '30%', gap: 6, borderWidth: 1, borderColor: '#2a2a2a' },
  stackLabel:        { color: '#aaa', fontSize: 11, textAlign: 'center' },

  divider:           { width: '100%', height: 1, backgroundColor: '#1e1e1e', marginVertical: 12 },
  footer:            { color: '#333', fontSize: 11, textAlign: 'center', marginTop: 8 },
});