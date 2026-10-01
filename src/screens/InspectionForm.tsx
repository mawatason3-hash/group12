import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {createNativeStackNavigator, type NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenHeader} from '../components/ScreenHeader';
import {GROUP_CODE} from '../constants/group';
import type {NewInspectionStackParamList} from '../navigation/types';
import {STALL_CODE_ERROR, PHONE_ERROR, STALL_CODE_PATTERN, PHONE_PATTERN} from '../utils/validation';
import {c, appShadow} from '../theme';

type InspectionDraft = {
  vendorAlias: string;
  stallCode: string;
  category: string;
  phone: string;
  risk: string;
  consent: boolean;
};

type InspectionRecord = {
  id: string;
  vendorAlias: string;
  stallCode: string;
  category: string;
  phone: string;
  risk: string;
  imageUri?: string;
  savedAt: string;
};

type Errors = Partial<Record<'vendorAlias' | 'stallCode' | 'phone' | 'consent' | 'photo', string>>;

type RecordsStore = {
  records: InspectionRecord[];
  addRecord: (record: InspectionRecord) => void;
};

const RecordsContext = createContext<RecordsStore>({records: [], addRecord: () => {}});

export function InspectionRecordsProvider({children}: {children: React.ReactNode}) {
  const [records, setRecords] = useState<InspectionRecord[]>([]);

  const addRecord = (record: InspectionRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  return <RecordsContext.Provider value={{records, addRecord}}>{children}</RecordsContext.Provider>;
}

export function useInspectionRecords() {
  return useContext(RecordsContext);
}

type InspectionDraftContextValue = {
  draft: InspectionDraft;
  setDraft: React.Dispatch<React.SetStateAction<InspectionDraft>>;
  imageUri: string | undefined;
  setImageUri: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const InspectionDraftContext = createContext<InspectionDraftContextValue | null>(null);

function useInspectionDraftContext() {
  const context = useContext(InspectionDraftContext);
  if (!context) {
    throw new Error('InspectionDraftContext is missing');
  }
  return context;
}

function createInitialDraft(stallCode = ''): InspectionDraft {
  return {
    vendorAlias: '',
    stallCode,
    category: 'Fresh produce',
    phone: '',
    risk: 'Low',
    consent: false,
  };
}

function InspectionDraftProvider({children}: {children: React.ReactNode}) {
  const [draft, setDraft] = useState<InspectionDraft>(() => createInitialDraft());
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  return (
    <InspectionDraftContext.Provider value={{draft, setDraft, imageUri, setImageUri}}>
      {children}
    </InspectionDraftContext.Provider>
  );
}

function validate(values: InspectionDraft & {imageUri?: string}): Errors {
  const errors: Errors = {};
  if (!values.vendorAlias.trim()) errors.vendorAlias = 'Enter a vendor alias.';
  if (!STALL_CODE_PATTERN.test(values.stallCode.trim())) errors.stallCode = STALL_CODE_ERROR;
  if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = PHONE_ERROR;
  if (!values.consent) errors.consent = 'Consent is required.';
  if (!values.imageUri) errors.photo = 'Add an evidence photo before reviewing.';
  return errors;
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        accessibilityLabel={props.label}
        style={[styles.input, props.error ? styles.inputError : null]}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={c.muted}
        autoCapitalize="characters"
      />
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
    </View>
  );
}

function Chips(props: {options: string[]; value: string; onChange: (value: string) => void}) {
  return (
    <View style={styles.chipRow}>
      {props.options.map(option => (
        <Pressable
          key={option}
          onPress={() => props.onChange(option)}
          style={[styles.chip, props.value === option ? styles.chipOn : null]}
          accessibilityRole="button"
          accessibilityLabel={`Select ${option}`}
          hitSlop={6}
        >
          <Text style={props.value === option ? styles.chipTextOn : styles.chipText}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function useBottomPadding() {
  const insets = useSafeAreaInsets();
  return 82 + insets.bottom;
}

function NewInspectionFormScreen({navigation, route}: NativeStackScreenProps<NewInspectionStackParamList, 'NewInspectionForm'>) {
  const {draft, setDraft, imageUri, setImageUri} = useInspectionDraftContext();
  const [errors, setErrors] = useState<Errors>({});
  const bottomPadding = useBottomPadding();

  useEffect(() => {
    if (route.params?.stallCode) {
      setDraft(prev => ({...prev, stallCode: route.params.stallCode ?? prev.stallCode}));
    }
  }, [route.params?.stallCode, setDraft]);

  function onContinue() {
    const validationErrors = validate({...draft, imageUri});
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      navigation.navigate('Review', {
        draft: {...draft},
        imageUri,
        timestamp: new Date().toLocaleString(),
      });
    }
  }

  const updateDraft = <K extends keyof InspectionDraft>(key: K, value: InspectionDraft[K]) => {
    setDraft(prev => ({...prev, [key]: value}));
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.page, {paddingBottom: bottomPadding}]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="New inspection" />

      <View style={styles.panel}>
        <Field label="Vendor alias" value={draft.vendorAlias} onChangeText={value => updateDraft('vendorAlias', value)} error={errors.vendorAlias} />
        <Field label="Stall code" value={draft.stallCode} onChangeText={value => updateDraft('stallCode', value)} error={errors.stallCode} placeholder="MSZ-A12" />

        <Text style={styles.label}>Category</Text>
        <Chips options={['Fresh produce', 'Fish and meat', 'Dry goods']} value={draft.category} onChange={value => updateDraft('category', value)} />

        <Field label="Contact number" value={draft.phone} onChangeText={value => updateDraft('phone', value)} error={errors.phone} placeholder="0781234567" />

        <Text style={styles.label}>Risk level</Text>
        <Chips options={['Low', 'Medium', 'High']} value={draft.risk} onChange={value => updateDraft('risk', value)} />

        <View style={[styles.row, {marginTop: 12}]}> 
          <Switch
            value={draft.consent}
            onValueChange={value => updateDraft('consent', value)}
            trackColor={{true: c.blue, false: '#3A4F65'}}
            accessibilityLabel="Vendor consents to this inspection"
          />
          <Text style={styles.switchText}>Vendor consents to this inspection</Text>
        </View>
        {errors.consent ? <Text style={styles.error}>{errors.consent}</Text> : null}

        <Text style={styles.sectionTitle}>Evidence photo</Text>
        {imageUri ? (
          <View style={styles.photoBox}>
            <Image source={{uri: imageUri}} style={styles.thumb} accessibilityLabel="Selected evidence photo" />
            <View style={styles.photoActions}>
              <Pressable
                style={[styles.photoAction, styles.photoActionPrimary]}
                onPress={() => navigation.navigate('Camera')}
                accessibilityRole="button"
                accessibilityLabel="Replace photo"
                hitSlop={8}
              >
                <Text style={styles.photoActionTextPrimary}>Replace photo</Text>
              </Pressable>
              <Pressable
                style={styles.photoAction}
                onPress={() => {
                  setImageUri(undefined);
                  setErrors(prev => ({...prev, photo: undefined}));
                }}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                hitSlop={8}
              >
                <Text style={styles.photoActionText}>Remove photo</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={styles.addPhotoButton}
            onPress={() => navigation.navigate('Camera')}
            accessibilityRole="button"
            accessibilityLabel="Add evidence photo"
            hitSlop={8}
          >
            <Text style={styles.addPhotoText}>Add evidence photo</Text>
          </Pressable>
        )}
        {errors.photo ? <Text style={styles.error}>{errors.photo}</Text> : null}

        <Pressable
          style={[styles.btn, styles.btnPrimary, {marginTop: 16}]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
            onContinue();
          }}
          accessibilityRole="button"
          accessibilityLabel="Continue to review"
          hitSlop={8}
        >
          <Text style={styles.btnPrimaryText}>Continue to review</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ReviewScreen({navigation, route}: NativeStackScreenProps<NewInspectionStackParamList, 'Review'>) {
  const {addRecord} = useInspectionRecords();
  const {setDraft, setImageUri} = useInspectionDraftContext();
  const {draft, imageUri, timestamp} = route.params;

  function onSave() {
    addRecord({
      id: Date.now().toString(),
      vendorAlias: draft.vendorAlias.trim(),
      stallCode: draft.stallCode,
      category: draft.category,
      phone: draft.phone,
      risk: draft.risk,
      imageUri,
      savedAt: timestamp,
    });

    setDraft(createInitialDraft());
    setImageUri(undefined);
    navigation.navigate('NewInspectionForm', {stallCode: draft.stallCode});
  }

  return (
    <ScrollView contentContainerStyle={[styles.page, {paddingBottom: 120}]} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Inspection review" />

      <View style={styles.reviewCard}>
        <Text style={styles.reviewText}>Vendor alias: {draft.vendorAlias}</Text>
        <Text style={styles.reviewText}>Stall code: {draft.stallCode}</Text>
        <Text style={styles.reviewText}>Category: {draft.category}</Text>
        <Text style={styles.reviewText}>Contact: {draft.phone}</Text>
        <Text style={styles.reviewText}>Risk level: {draft.risk}</Text>
        <Text style={styles.reviewText}>Consent: Confirmed</Text>
        <Text style={styles.reviewText}>Timestamp: {timestamp}</Text>
        <Text style={styles.reviewText}>Group verification code: {GROUP_CODE}</Text>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.reviewImage} accessibilityLabel="Inspection evidence" />
        ) : null}
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Edit inspection" hitSlop={8}>
          <Text style={styles.secondaryText}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onSave} accessibilityRole="button" accessibilityLabel="Save record" hitSlop={8}>
          <Text style={styles.btnPrimaryText}>Save record</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function EvidenceCameraScreen({navigation}: NativeStackScreenProps<NewInspectionStackParamList, 'Camera'>) {
  const {imageUri, setImageUri} = useInspectionDraftContext();
  const [permission, setPermission] = useState<boolean | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | undefined>(imageUri);
  const bottomPadding = useBottomPadding();

  async function requestCameraAccess() {
    const response = await ImagePicker.requestCameraPermissionsAsync();
    if (response.granted) {
      setPermission(true);
      return true;
    }
    setPermission(false);
    return false;
  }

  async function takePhoto() {
    const canUse = await requestCameraAccess();
    if (!canUse) {
      setNotice('Camera permission was denied. You can open settings to allow it, or choose a photo from the gallery.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) {
      setNotice('No photo selected. You can try again or choose from the gallery.');
      return;
    }

    const next = result.assets[0].uri;
    setPreviewUri(next);
    setImageUri(next);
    setNotice(null);
  }

  async function chooseFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) {
      setNotice('No photo selected. You can try again or choose from the gallery.');
      return;
    }

    const next = result.assets[0].uri;
    setPreviewUri(next);
    setImageUri(next);
    setNotice(null);
  }

  function usePhoto() {
    if (!previewUri) return;
    setImageUri(previewUri);
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={[styles.page, {paddingBottom: bottomPadding}]} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Evidence photo" />

      <View style={styles.cameraCard}>
        <Text style={styles.cameraText}>
          The camera is used only to photograph visible stall conditions as inspection evidence. Photos stay on this device and are never uploaded or shared.
        </Text>

        {permission === false ? (
          <View style={styles.permissionPanel}>
            <Text style={styles.permissionText}>
              Camera permission was denied. You can open settings to allow it, or choose a photo from the gallery.
            </Text>
            <Pressable
              style={[styles.btn, styles.btnPrimary, {marginTop: 8}]}
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              hitSlop={8}
            >
              <Text style={styles.btnPrimaryText}>Open settings</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, {marginTop: 8}]}
              onPress={chooseFromGallery}
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery instead"
              hitSlop={8}
            >
              <Text style={styles.secondaryText}>Choose from gallery instead</Text>
            </Pressable>
          </View>
        ) : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        {previewUri ? (
          <View style={styles.photoBox}>
            <Image source={{uri: previewUri}} style={styles.previewImage} accessibilityLabel="Evidence photo preview" />
            <View style={styles.photoActions}>
              <Pressable style={[styles.photoAction, styles.photoActionPrimary]} onPress={usePhoto} accessibilityRole="button" accessibilityLabel="Use this photo" hitSlop={8}>
                <Text style={styles.photoActionTextPrimary}>Use this photo</Text>
              </Pressable>
              <Pressable style={styles.photoAction} onPress={takePhoto} accessibilityRole="button" accessibilityLabel="Replace photo" hitSlop={8}>
                <Text style={styles.photoActionText}>Replace</Text>
              </Pressable>
              <Pressable
                style={styles.photoAction}
                onPress={() => {
                  setPreviewUri(undefined);
                  setImageUri(undefined);
                  setNotice(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                hitSlop={8}
              >
                <Text style={styles.photoActionText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {!previewUri ? (
          <View style={styles.actionStack}>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={takePhoto}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
              hitSlop={8}
            >
              <Text style={styles.btnPrimaryText}>Take photo</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, {marginTop: 12}]}
              onPress={chooseFromGallery}
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery"
              hitSlop={8}
            >
              <Text style={styles.secondaryText}>Choose from gallery</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const Stack = createNativeStackNavigator<NewInspectionStackParamList>();

export function NewInspectionStack() {
  return (
    <InspectionDraftProvider>
      <Stack.Navigator
        initialRouteName="NewInspectionForm"
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: c.shell},
        }}
      >
        <Stack.Screen name="NewInspectionForm" component={NewInspectionFormScreen} initialParams={{stallCode: undefined}} />
        <Stack.Screen name="Camera" component={EvidenceCameraScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
      </Stack.Navigator>
    </InspectionDraftProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: c.shell,
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: c.ink,
    letterSpacing: -0.5,
  },
  panel: {
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: c.line,
    ...appShadow,
  },
  cameraCard: {
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: c.line,
    ...appShadow,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '700',
    color: c.ink,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '800',
    color: c.ink,
  },
  input: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: c.surface,
    color: c.ink,
    minHeight: 48,
  },
  inputError: {
    borderColor: c.red,
    backgroundColor: 'rgba(255,122,122,0.08)',
  },
  error: {
    color: c.red,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  notice: {
    color: c.ink,
    backgroundColor: 'rgba(61, 193, 158, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 193, 158, 0.4)',
    padding: 10,
    borderRadius: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: c.surface,
    minHeight: 48,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: c.blue,
    borderColor: c.blue,
  },
  chipText: {
    color: c.ink,
    fontWeight: '600',
  },
  chipTextOn: {
    color: '#fff',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchText: {
    flex: 1,
    color: c.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  btn: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: c.surface,
    minHeight: 48,
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: c.blue,
    borderColor: c.blue,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
  },
  secondaryText: {
    color: c.ink,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: c.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.line,
    padding: 16,
    gap: 8,
    ...appShadow,
  },
  reviewText: {
    fontSize: 14,
    color: c.ink,
    fontWeight: '600',
  },
  addPhotoButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  addPhotoText: {
    color: c.ink,
    fontWeight: '700',
    fontSize: 15,
  },
  photoBox: {
    gap: 10,
    marginTop: 6,
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  photoAction: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: c.surface,
  },
  photoActionPrimary: {
    backgroundColor: c.blue,
    borderColor: c.blue,
  },
  photoActionText: {
    color: c.ink,
    fontWeight: '700',
    textAlign: 'center',
  },
  photoActionTextPrimary: {
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
  },
  reviewImage: {
    width: '100%',
    minHeight: 220,
    borderRadius: 12,
    backgroundColor: c.surface,
    marginTop: 8,
  },
  actionStack: {
    gap: 12,
    marginTop: 10,
  },
  cameraText: {
    color: c.ink,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  permissionPanel: {
    marginTop: 8,
    gap: 8,
  },
  permissionText: {
    color: c.ink,
    fontSize: 14,
    lineHeight: 22,
  },
});
