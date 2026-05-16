import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import GlowCard from '../components/GlowCard';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { APP_VERSION } from '../constants/config';

interface ServiceStatus {
  name: string;
  icon: string;
  key: string;
  ok: boolean | null;
}

const SERVICES: ServiceStatus[] = [
  { name: 'Gemini Vision', icon: '✦', key: 'gemini', ok: null },
  { name: 'ElevenLabs', icon: '🎙', key: 'elevenlabs', ok: null },
  { name: 'Deepgram', icon: '📡', key: 'deepgram', ok: null },
  { name: 'Twilio', icon: '📞', key: 'twilio', ok: null },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  const [urlInput, setUrlInput] = useState(state.backendUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [services, setServices] = useState<ServiceStatus[]>(SERVICES);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    fetchServiceStatus();
  }, []);

  const fetchServiceStatus = async () => {
    setLoadingServices(true);
    try {
      const res = await fetch(`${state.backendUrl}/api/transcripts`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        // Backend is up — mark all services as nominally OK
        setServices(SERVICES.map((s) => ({ ...s, ok: true })));
      } else {
        setServices(SERVICES.map((s) => ({ ...s, ok: false })));
      }
    } catch {
      setServices(SERVICES.map((s) => ({ ...s, ok: false })));
    } finally {
      setLoadingServices(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch(`${urlInput}/api/transcripts`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        setTestStatus('ok');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }
  };

  const handleSaveUrl = () => {
    dispatch({ type: 'SET_BACKEND_URL', payload: urlInput });
    Alert.alert('Saved', 'Backend URL updated. Reconnecting...');
  };

  const testStatusColor =
    testStatus === 'ok' ? COLORS.green : testStatus === 'error' ? COLORS.red : COLORS.textMuted;

  const testStatusText =
    testStatus === 'idle'
      ? 'Test Connection'
      : testStatus === 'testing'
      ? 'Testing...'
      : testStatus === 'ok'
      ? '✓ Connected'
      : '✗ Connection Failed';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* ── Backend Config ── */}
        <GlowCard glowColor="none" style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Connection</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="http://localhost:3001"
              placeholderTextColor={COLORS.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <Text style={styles.inputHint}>
            For physical device: use your Mac's local IP{'\n'}
            e.g. http://192.168.1.x:3001
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleTestConnection}
              style={[styles.testBtn, { borderColor: testStatusColor }]}
              activeOpacity={0.8}
              disabled={testStatus === 'testing'}
            >
              {testStatus === 'testing' ? (
                <ActivityIndicator size="small" color={COLORS.textMuted} />
              ) : (
                <Text style={[styles.testBtnText, { color: testStatusColor }]}>
                  {testStatusText}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveUrl} style={styles.saveBtn} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </GlowCard>

        {/* ── Demo Mode ── */}
        <GlowCard glowColor="none" style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Mode</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>
                {state.demoMode ? 'Demo mode is ON' : 'Demo mode is OFF'}
              </Text>
              <Text style={styles.toggleDesc}>
                {state.demoMode
                  ? 'Simulates AI conversation without real backend calls'
                  : 'Uses live backend — ensure backend URL is reachable'}
              </Text>
            </View>
            <Switch
              value={state.demoMode}
              onValueChange={(v) => dispatch({ type: 'SET_DEMO_MODE', payload: v })}
              trackColor={{ false: COLORS.cardBorder, true: `${COLORS.green}88` }}
              thumbColor={state.demoMode ? COLORS.green : COLORS.textDim}
              ios_backgroundColor={COLORS.cardBorder}
            />
          </View>
        </GlowCard>

        {/* ── Service Status ── */}
        <GlowCard glowColor="none" style={styles.section}>
          <View style={styles.serviceTitleRow}>
            <Text style={styles.sectionTitle}>Service Status</Text>
            <TouchableOpacity onPress={fetchServiceStatus} disabled={loadingServices}>
              {loadingServices ? (
                <ActivityIndicator size="small" color={COLORS.textMuted} />
              ) : (
                <Ionicons name="refresh-outline" size={18} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.servicesList}>
            {services.map((svc) => (
              <View key={svc.key} style={styles.serviceRow}>
                <Text style={styles.serviceIcon}>{svc.icon}</Text>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <View style={styles.serviceStatusRight}>
                  {svc.ok === null ? (
                    <Text style={styles.serviceUnknown}>—</Text>
                  ) : svc.ok ? (
                    <Text style={styles.serviceOk}>✓</Text>
                  ) : (
                    <Text style={styles.serviceError}>✗</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.serviceNote}>
            Status reflects backend connectivity, not individual service health
          </Text>
        </GlowCard>

        {/* ── App Info ── */}
        <GlowCard glowColor="none" style={styles.appInfoCard}>
          <Text style={styles.appInfoTitle}>🌿 AgriLens AI</Text>
          <Text style={styles.appInfoSub}>Agricultural Intelligence Platform</Text>
          <View style={styles.dividerLine} />
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Build</Text>
            <Text style={styles.appInfoValue}>Hackathon Demo</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Platform</Text>
            <Text style={styles.appInfoValue}>iOS · Expo 51</Text>
          </View>
          <View style={styles.dividerLine} />
          <Text style={styles.poweredBy}>
            Powered by Meta · Google · ElevenLabs · Deepgram · Twilio
          </Text>
        </GlowCard>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerPlaceholder: {
    width: 38,
  },

  // Section
  section: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Input
  inputRow: {
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#0f0f1a',
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontFamily: 'Courier',
  },
  inputHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  testBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.green}18`,
    borderWidth: 1,
    borderColor: `${COLORS.green}44`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.green,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  toggleInfo: {
    flex: 1,
    gap: 3,
  },
  toggleLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  toggleDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },

  // Services
  serviceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicesList: {
    gap: SPACING.sm,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff08',
  },
  serviceIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  serviceName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  serviceStatusRight: {
    width: 24,
    alignItems: 'center',
  },
  serviceUnknown: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDim,
  },
  serviceOk: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.green,
    fontWeight: '700',
  },
  serviceError: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.red,
    fontWeight: '700',
  },
  serviceNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
    fontStyle: 'italic',
  },

  // App Info
  appInfoCard: {
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.green,
  },
  appInfoSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.xs,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  appInfoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  appInfoValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  poweredBy: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },

  bottomPad: {
    height: SPACING.xl,
  },
});
