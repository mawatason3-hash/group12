import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, {FadeInUp, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {ScreenHeader} from '../components/ScreenHeader';
import {appShadow, c, MIN_TOUCH} from '../theme';
import {logEvent} from '../qa/eventLog';

export type Shot = {
  uri: string;
  label: string;
  width: number;
  height: number;
  format: string;
  source: 'camera' | 'gallery';
  takenAt: string;
};

type Notice = {kind: 'info' | 'error'; text: string} | null;

type Props = {
  active?: boolean;
  onAccepted?: (shot: Shot) => void;
};

function shortPhotoValue(value: string): string {
  const raw = value.trim();
  if (!raw) return 'Photo captured';
  if (raw.startsWith('data:') || raw.toLowerCase().includes('base64')) return 'Photo captured';
  const fileName = raw.split('/').pop()?.split('?')[0] ?? raw;
  return fileName.length > 32 ? 'Photo captured' : fileName;
}

function makeShot(uri: string, width: number, height: number, source: Shot['source'], mime?: string | null): Shot {
  const normalized = shortPhotoValue(uri);
  const ext = uri.split('?')[0].split('.').pop() ?? '';
  const format = (mime ? mime.split('/')[1] : ext || 'unknown').toUpperCase();
  return {
    uri,
    label: normalized,
    width,
    height,
    format,
    source,
    takenAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'}),
  };
}

export function FieldCamera({active = true, onAccepted}: Props) {
  const camRef = useRef<CameraView>(null);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [sharp, setSharp] = useState(false);
  const [kept, setKept] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [focusPoint, setFocusPoint] = useState<{x: number; y: number} | null>(null);

  useEffect(() => {
    if (permission) {
      logEvent('permission', `${permission.status}, canAskAgain=${permission.canAskAgain}`);
    }
  }, [permission?.status, permission?.canAskAgain]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        logEvent('app_resumed');
        getPermission();
      }
    });
    return () => sub.remove();
  }, [getPermission]);

  useEffect(() => {
    logEvent(active ? 'screen_visible' : 'screen_hidden');
    if (!active) setReady(false);
  }, [active]);

  const reviewTranslate = useAnimatedStyle(() => ({
    opacity: withTiming(shot ? 1 : 0, {duration: 220}),
    transform: [{translateY: withTiming(shot ? 0 : 260, {duration: 260})}],
  }));

  async function askPermission() {
    logEvent('permission_requested');
    setNotice(null);
    try {
      await requestPermission();
    } catch (error) {
      console.warn('Permission request failed', error);
      setNotice({kind: 'error', text: 'Camera permission could not be requested. Please try again.'});
      logEvent('permission_failed', String(error));
    }
  }

  async function capture() {
    if (busy || !ready || !camRef.current) return;
    setBusy(true);
    setNotice(null);
    try {
      const photo = await camRef.current.takePictureAsync({quality: 0.8});
      if (!photo?.uri) throw new Error('No photo returned');
      setShot(makeShot(photo.uri, photo.width ?? 0, photo.height ?? 0, 'camera'));
      setReady(false);
      logEvent('captured', `${photo.width}x${photo.height}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (error) {
      setNotice({kind: 'error', text: 'The photo could not be taken. Please try again.'});
      logEvent('capture_failed', String(error));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function pickFromGallery() {
    setBusy(true);
    setNotice(null);
    logEvent('gallery_opened');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled || result.assets.length === 0) {
        logEvent('gallery_cancelled');
        setNotice({kind: 'info', text: 'No photo selected. You can try again or choose from the gallery.'});
        return;
      }

      const image = result.assets[0];
      setShot(makeShot(image.uri, image.width ?? 0, image.height ?? 0, 'gallery', image.mimeType));
      logEvent('gallery_selected', `${image.width}x${image.height}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (error) {
      logEvent('gallery_failed', String(error));
      setNotice({kind: 'error', text: 'The gallery could not be opened. Please try again.'});
    } finally {
      setBusy(false);
    }
  }

  function retake() {
    logEvent('retake', shot ? shot.source : 'unknown');
    setShot(null);
    setSharp(false);
    setKept(false);
    setNotice(null);
    setReady(true);
  }

  function removeShot() {
    setShot(null);
    setSharp(false);
    setKept(false);
    setNotice(null);
    setReady(false);
  }

  function keep() {
    if (!shot) return;
    setKept(true);
    logEvent('photo_kept', `${shot.source} ${shot.width}x${shot.height}`);
    onAccepted?.(shot);
    setNotice({kind: 'info', text: 'Photo kept on this phone. It has not been uploaded or shared.'});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }

  function handleFocus(event: {nativeEvent: {locationX: number; locationY: number}}) {
    const x = event.nativeEvent.locationX;
    const y = event.nativeEvent.locationY;
    setFocusPoint({x, y});
    setTimeout(() => setFocusPoint(null), 320);
  }

  const renderPermissionState = () => {
    if (!permission) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator color={c.blue} size="large" />
          <Text style={styles.body}>Checking camera access...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <ScrollView contentContainerStyle={styles.centerBox}>
          <Text style={styles.title} accessibilityRole="header">Camera access needed</Text>
          <Text style={styles.body}>
            The camera is used only to photograph visible stall conditions as inspection evidence. Photos stay on this device and are never uploaded or shared.
          </Text>

          {permission.canAskAgain ? (
            <ActionButton label="Allow camera" primary onPress={askPermission} />
          ) : (
            <>
              <Text style={styles.warning}>Camera access was turned off. Open phone settings and allow Camera.</Text>
              <ActionButton label="Open phone settings" primary onPress={() => Linking.openSettings()} />
            </>
          )}

          <ActionButton label="Choose from gallery instead" onPress={pickFromGallery} />
          <NoticeText notice={notice} />
        </ScrollView>
      );
    }

    return null;
  };

  if (shot) {
    const megapixels = ((shot.width * shot.height) / 1000000).toFixed(1);
    const orientation = shot.width >= shot.height ? 'Landscape' : 'Portrait';

    return (
      <View style={styles.flex}>
        <Image
          source={{uri: shot.uri}}
          style={styles.previewImage}
          accessibilityLabel="Photo preview"
          resizeMode="cover"
        />

        <Animated.View style={[styles.reviewSheet, reviewTranslate]}>
          <Text style={styles.sectionTitle}>Photo details</Text>
          <View style={styles.metaGrid}>
            {[
              ['File', shot.label],
              ['Source', shot.source === 'camera' ? 'Camera' : 'Gallery'],
              ['Size', `${shot.width} × ${shot.height} px`],
              ['Megapixels', `${megapixels} MP`],
              ['Orientation', orientation],
              ['Format', shot.format],
              ['Time', shot.takenAt],
            ].map(([key, value], index) => {
              const safeValue = shortPhotoValue(String(value ?? 'Photo captured'));
              return (
                <Animated.View
                  key={String(key)}
                  style={styles.metaCell}
                  entering={FadeInUp.delay(index * 50).duration(220)}
                >
                  <Text style={styles.metaKey}>{key}</Text>
                  <Text style={styles.metaValue} numberOfLines={1} ellipsizeMode="middle">
                    {safeValue}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {!kept && (
            <View style={styles.sharpRow}>
              <Switch
                value={sharp}
                onValueChange={setSharp}
                accessibilityLabel="I checked that the evidence photo is sharp and fills the frame"
                trackColor={{true: c.blue, false: c.line}}
              />
              <Text style={styles.sharpText}>I checked: the evidence photo is sharp and fills the frame.</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <ActionButton label="Replace photo" onPress={retake} />
            {!kept && <ActionButton label="Use photo" primary onPress={keep} disabled={!sharp} />}
            <ActionButton label="Remove" onPress={removeShot} />
          </View>

          <NoticeText notice={notice} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.appFrame}>
      <ScreenHeader title="Camera" />

      <View style={styles.statsRow}>
        <StatCard label="Mode" value={facing === 'back' ? 'Rear' : 'Front'} accent="#0F5DAA" />
        <StatCard label="Flash" value={flash === 'on' ? 'On' : 'Off'} accent="#D9A63A" />
        <StatCard label="Status" value={ready ? 'Live' : 'Warm'} accent="#1E7A4D" />
      </View>

      {permission && permission.granted && active ? (
        <Pressable style={styles.cameraWrap} onPress={handleFocus}>
          <CameraView
            ref={camRef}
            style={styles.flex}
            facing={facing}
            flash={flash}
            onCameraReady={() => {
              setReady(true);
              logEvent('camera_ready');
            }}
          />

          {focusPoint && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: focusPoint.x - 28,
                top: focusPoint.y - 28,
                width: 56,
                height: 56,
                borderWidth: 2,
                borderColor: '#fff',
                borderRadius: 999,
              }}
            />
          )}
        </Pressable>
      ) : (
        <View style={styles.flex}>{renderPermissionState()}</View>
      )}

      {permission && permission.granted && active && (
        <View style={styles.toolbar}>
          <ActionChip
            label={flash === 'on' ? 'Flash on' : 'Flash off'}
            onPress={() => setFlash(current => (current === 'on' ? 'off' : 'on'))}
          />
          <ActionChip
            label={facing === 'back' ? 'Front' : 'Back'}
            onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
          />
        </View>
      )}

      {permission && permission.granted && active && (
        <View style={styles.bottomSheet}>
          <NoticeText notice={notice} />
          {!ready && <Text style={styles.note}>Starting camera...</Text>}
          <View style={styles.buttonRow}>
            <ActionButton label="Gallery" onPress={pickFromGallery} disabled={busy} />
            <ActionButton label={busy ? 'Working...' : 'Capture'} primary onPress={capture} disabled={!ready || busy} />
          </View>
        </View>
      )}

      {!permission?.granted && renderPermissionState()}
    </View>
  );
}

function NoticeText({notice}: {notice: Notice}) {
  if (!notice) return null;
  return (
    <Text
      style={notice.kind === 'error' ? styles.errorText : styles.note}
      accessibilityLiveRegion="polite"
      accessibilityRole={notice.kind === 'error' ? 'alert' : undefined}
    >
      {notice.text}
    </Text>
  );
}

function StatCard({label, value, accent}: {label: string; value: string; accent: string}) {
  return (
    <View style={[styles.statCard, {borderColor: accent + '33'}]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statDot, {backgroundColor: accent}]} />
    </View>
  );
}

function ActionChip({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <Pressable style={styles.chip} accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  primary,
  disabled,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: !!disabled}}
      style={[styles.actionButton, primary && styles.actionButtonPrimary, disabled && styles.actionButtonDisabled]}
    >
      <Text style={[styles.actionButtonText, primary && styles.actionButtonTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  appFrame: {
    flex: 1,
    backgroundColor: c.shell,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: '#F7F9FB',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    position: 'relative',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1B2B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  statDot: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  flex: {flex: 1, backgroundColor: c.paper},
  cameraWrap: {flex: 1, minHeight: 220},
  centerBox: {
    flexGrow: 1,
    backgroundColor: c.card,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DDE1',
  },
  title: {fontSize: 30, fontWeight: '800', color: c.ink, lineHeight: 36},
  body: {fontSize: 16, color: '#E6EEF7', lineHeight: 24},
  warning: {fontSize: 14, color: '#FFDDE2', fontWeight: '700', lineHeight: 20},
  note: {fontSize: 14, color: '#E6EEF7'},
  errorText: {fontSize: 14, color: '#FFDDE2', fontWeight: '700'},
  toolbar: {
    position: 'absolute',
    top: 160,
    right: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 2,
  },
  chip: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(15,31,46,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
    ...appShadow,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: MIN_TOUCH,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: c.blue,
    backgroundColor: c.paper,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  actionButtonPrimary: {
    backgroundColor: c.blue,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: c.blue,
  },
  actionButtonTextPrimary: {
    color: '#fff',
  },
  previewImage: {
    width: '100%',
    height: 260,
    backgroundColor: c.ink,
  },
  reviewSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.paper,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    gap: 12,
    ...appShadow,
  },
  sectionTitle: {fontSize: 18, fontWeight: '700', color: c.ink},
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaCell: {
    width: '31%',
    minWidth: 90,
    padding: 8,
    backgroundColor: c.surface,
    borderRadius: 10,
  },
  metaKey: {fontSize: 12, color: c.muted},
  metaValue: {marginTop: 4, fontSize: 14, fontWeight: '700', color: c.ink},
  sharpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: MIN_TOUCH,
  },
  sharpText: {flex: 1, fontSize: 16, color: c.ink, lineHeight: 24},
});
