import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import GlowCard from '../components/GlowCard';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH - SPACING.md * 2;

export default function ScanScreen() {
  const router = useRouter();
  const { state, analyzeImage } = useApp();
  const [localImage, setLocalImage] = useState<string | null>(state.uploadedImageUri);
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const streamDot = useRef(new Animated.Value(1)).current;

  // Meta Glasses glow pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  // Streaming dot
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(streamDot, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(streamDot, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [streamDot]);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is needed to capture produce images.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library permission is needed to select images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!localImage) return;
    try {
      await analyzeImage(localImage);
      router.push('/diagnosis');
    } catch (err) {
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
    }
  };

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
          <Text style={styles.headerTitle}>Scan Produce</Text>
          <View style={styles.lotPill}>
            <Text style={styles.lotPillText}>Lot #6</Text>
          </View>
        </View>

        {/* ── Image Preview Area ── */}
        <View style={styles.imageArea}>
          {!localImage ? (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={52} color={COLORS.textDim} />
              <Text style={styles.placeholderTitle}>No Image Selected</Text>
              <Text style={styles.placeholderSub}>
                Capture or upload a produce image for AI quality analysis
              </Text>
            </View>
          ) : (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: localImage }} style={styles.image} resizeMode="cover" />
              {state.isAnalyzing && (
                <View style={styles.analyzeOverlay}>
                  <ActivityIndicator size="large" color={COLORS.green} />
                  <Text style={styles.analyzingText}>Analyzing with Gemini AI...</Text>
                  <Text style={styles.analyzingSubText}>Vision model processing produce quality</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── Meta Glasses Simulation ── */}
        <Animated.View style={{ opacity: glowAnim }}>
          <GlowCard glowColor="green" style={styles.glassesCard}>
            <View style={styles.glassesRow}>
              <View style={styles.glassesLeft}>
                <Ionicons name="glasses-outline" size={20} color={COLORS.green} />
                <Text style={styles.glassesLabel}>Meta Glasses</Text>
              </View>
              <View style={styles.streamingRow}>
                <Animated.View style={[styles.streamDot, { opacity: streamDot }]} />
                <Text style={styles.streamingText}>Streaming</Text>
              </View>
            </View>
            <Text style={styles.glassesSub}>
              AR overlay active · Real-time feed to AgriLens AI
            </Text>
          </GlowCard>
        </Animated.View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={pickFromCamera}
            activeOpacity={0.8}
            disabled={state.isAnalyzing}
          >
            <LinearGradient
              colors={['#1e1e2e', '#13131a']}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="camera" size={22} color={COLORS.green} />
              <Text style={styles.actionBtnText}>Camera</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={pickFromLibrary}
            activeOpacity={0.8}
            disabled={state.isAnalyzing}
          >
            <LinearGradient
              colors={['#1e1e2e', '#13131a']}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="images" size={22} color={COLORS.purple} />
              <Text style={styles.actionBtnText}>Library</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Analyze Button ── */}
        {localImage && (
          <TouchableOpacity
            onPress={handleAnalyze}
            activeOpacity={0.85}
            disabled={state.isAnalyzing}
            style={styles.analyzeBtn}
          >
            <LinearGradient
              colors={state.isAnalyzing ? ['#1a3a2a', '#1a3a2a'] : ['#00ff88', '#00cc6a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyzeBtnGradient}
            >
              {state.isAnalyzing ? (
                <View style={styles.analyzeBtnContent}>
                  <ActivityIndicator size="small" color={COLORS.green} />
                  <Text style={[styles.analyzeBtnText, { color: COLORS.green }]}>
                    Analyzing...
                  </Text>
                </View>
              ) : (
                <Text style={styles.analyzeBtnText}>Analyze Produce →</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Tip ── */}
        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textDim} />
          <Text style={styles.tipText}>
            Tip: Use any produce photo for demo. AI will always find quality issues.
          </Text>
        </View>

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
  lotPill: {
    backgroundColor: `${COLORS.green}18`,
    borderWidth: 1,
    borderColor: `${COLORS.green}44`,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lotPillText: {
    color: COLORS.green,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Image Area
  imageArea: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 0.75,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignSelf: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    borderRadius: RADIUS.xl,
  },
  placeholderTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  placeholderSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  analyzeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  analyzingText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.green,
  },
  analyzingSubText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },

  // Glasses Card
  glassesCard: {
    padding: SPACING.md,
    gap: 6,
  },
  glassesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  glassesLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  streamingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  streamDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.green,
  },
  streamingText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.green,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  glassesSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
  },
  actionBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Analyze Button
  analyzeBtn: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },
  analyzeBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  analyzeBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#0a0a0f',
    letterSpacing: 0.3,
  },

  // Tip
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: `${COLORS.blue}11`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.blue}22`,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },

  bottomPad: {
    height: SPACING.xl,
  },
});
