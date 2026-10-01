import React, {createContext, useContext, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import * as Haptics from 'expo-haptics';
import {GROUP_CODE} from '../constants/group';
import {STALL_CODE_PATTERN, PHONE_PATTERN, STALL_CODE_ERROR, PHONE_ERROR} from '../utils/validation';

type InspectionRecord = {
  id: string;
  vendorAlias: string;
  stallCode: string;
  category: string;
  phone: string;
  risk: string;
  savedAt: string;
};

type Errors = Partial<Record<'vendorAlias' | 'stallCode' | 'phone' | 'consent', string>>;

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

function validate(values: {vendorAlias: string; stallCode: string; phone: string; consent: boolean}): Errors {
  const errors: Errors = {};
  if (!values.vendorAlias.trim()) errors.vendorAlias = 'Enter a vendor alias.';
  if (!STALL_CODE_PATTERN.test(values.stallCode.trim())) errors.stallCode = STALL_CODE_ERROR;
  if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = PHONE_ERROR;
  if (!values.consent) errors.consent = 'Consent is required.';
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
        >
          <Text style={props.value === option ? styles.chipTextOn : styles.chipText}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function InspectFormScreen() {
  const {addRecord} = useInspectionRecords();
  const [vendorAlias, setVendorAlias] = useState('');
  const [stallCode, setStallCode] = useState('');
  const [category, setCategory] = useState('Fresh produce');
  const [phone, setPhone] = useState('');
  const [risk, setRisk] = useState('Low');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [reviewing, setReviewing] = useState(false);
  const [notice, setNotice] = useState('');
  const [reviewTime, setReviewTime] = useState('');

  function onContinue() {
    const validationErrors = validate({vendorAlias, stallCode, phone, consent});
    setErrors(validationErrors);
    setNotice('');

    if (Object.keys(validationErrors).length === 0) {
      setReviewTime(new Date().toLocaleString());
      setReviewing(true);
    }
  }

  function onSave() {
    addRecord({
      id: Date.now().toString(),
      vendorAlias: vendorAlias.trim(),
      stallCode,
      category,
      phone,
      risk,
      savedAt: reviewTime,
    });

    setVendorAlias('');
    setStallCode('');
    setPhone('');
    setConsent(false);
    setReviewing(false);
    setNotice('Record saved. Open the Records tab to see it.');
  }

  if (reviewing) {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.reviewText}>Vendor alias: {vendorAlias}</Text>
        <Text style={styles.reviewText}>Stall code: {stallCode}</Text>
        <Text style={styles.reviewText}>Category: {category}</Text>
        <Text style={styles.reviewText}>Contact: {phone}</Text>
        <Text style={styles.reviewText}>Risk level: {risk}</Text>
        <Text style={styles.reviewText}>Consent: Confirmed</Text>
        <Text style={styles.reviewText}>Timestamp: {reviewTime}</Text>
        <Text style={styles.reviewText}>Group code: {GROUP_CODE}</Text>

        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={() => setReviewing(false)}>
            <Text>Edit</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onSave}>
            <Text style={styles.btnPrimaryText}>Save record</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>New inspection</Text>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Field label="Vendor alias" value={vendorAlias} onChangeText={setVendorAlias} error={errors.vendorAlias} />
      <Field label="Stall code" value={stallCode} onChangeText={setStallCode} error={errors.stallCode} placeholder="MSZ-A12" />

      <Text style={styles.label}>Category</Text>
      <Chips options={['Fresh produce', 'Fish and meat', 'Dry goods']} value={category} onChange={setCategory} />

      <Field label="Contact number" value={phone} onChangeText={setPhone} error={errors.phone} placeholder="0781234567" />

      <Text style={styles.label}>Risk level</Text>
      <Chips options={['Low', 'Medium', 'High']} value={risk} onChange={setRisk} />

      <View style={[styles.row, {marginTop: 12}]}> 
        <Switch value={consent} onValueChange={setConsent} />
        <Text style={{flex: 1}}>Vendor consents to this inspection</Text>
      </View>
      {errors.consent ? <Text style={styles.error}>{errors.consent}</Text> : null}

      <Pressable
        style={[styles.btn, styles.btnPrimary, {marginTop: 16}]}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
          onContinue();
        }}
      >
        <Text style={styles.btnPrimaryText}>Continue to review</Text>
      </Pressable>
    </ScrollView>
  );
}

const COLORS = {
  white: '#FFFFFF',
  blue: '#1565C0',
  blueDark: '#0D47A1',
  blueLight: '#E3F2FD',
  red: '#D32F2F',
  redLight: '#FFEBEE',
  text: '#1F2937',
  border: '#D1D5DB',
};

const styles = StyleSheet.create({
  page: {
    padding: 16,
    gap: 8,
    backgroundColor: COLORS.white,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    color: COLORS.blueDark,
  },
  field: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.red,
    backgroundColor: COLORS.redLight,
  },
  error: {
    color: COLORS.red,
    fontSize: 13,
    marginTop: 2,
  },
  notice: {
    color: COLORS.blueDark,
    backgroundColor: COLORS.blueLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  chipOn: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  chipText: {
    color: COLORS.blue,
  },
  chipTextOn: {
    color: COLORS.white,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
