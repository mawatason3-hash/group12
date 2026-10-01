// Member B, Day 2: MotoRegisterApp
// Prediction: three fields. Submitting empty shows a red message under each
// bad field. A valid form shows a green confirmation and saves nothing.
import React, {useState} from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import {c, MIN_TOUCH} from '../theme';

// Pattern taken from the lecture deck (e.g. RAB 123C).
// Review it against real local plate rules before using it outside class.
const PLATE = /^[A-Z]{3}[- ]?\d{3}[A-Z]$/;

type Errors = {name?: string; plate?: string; zone?: string};

export function MotoRegister() {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [zone, setZone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  function submit() {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Enter the driver name.';
    if (!PLATE.test(plate)) e.plate = 'Use 3 letters, 3 digits, 1 letter. Example: RAB 123C';
    if (!zone.trim()) e.zone = 'Enter the zone where the driver works.';
    setErrors(e);
    setDone(Object.keys(e).length === 0);
    // Next: save only after explicit consent from the driver.
  }

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.title} accessibilityRole="header">Register moto driver</Text>

      <Field label="Driver name" help="Full name as on the ID card"
        value={name} onChangeText={setName} error={errors.name} />
      <Field label="Plate number" help="Letters are capitalised for you"
        value={plate} onChangeText={t => setPlate(t.toUpperCase())}
        error={errors.plate} autoCapitalize="characters" />
      <Field label="Zone" help="For example: Musanze town"
        value={zone} onChangeText={setZone} error={errors.zone} />

      <Pressable style={s.button} onPress={submit}
        accessibilityRole="button" accessibilityLabel="Register driver">
        <Text style={s.buttonText}>Register</Text>
      </Pressable>

      {done && (
        <Text style={s.ok} accessibilityRole="alert">
          Details look valid. Nothing has been saved.
        </Text>
      )}
    </ScrollView>
  );
}

type FieldProps = {
  label: string; help: string; value: string; error?: string;
  onChangeText: (t: string) => void; autoCapitalize?: 'characters' | 'none' | 'words';
};

function Field({label, help, value, onChangeText, error, autoCapitalize}: FieldProps) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        style={[s.input, error ? s.inputBad : null]}
      />
      {error ? (
        <Text style={s.error} accessibilityRole="alert">{error}</Text>
      ) : (
        <Text style={s.help}>{help}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: {padding: 24, backgroundColor: c.paper, flexGrow: 1},
  title: {fontSize: 25, fontWeight: '700', color: c.ink, marginBottom: 16},
  field: {marginBottom: 18},
  label: {fontSize: 16, fontWeight: '600', color: c.ink, marginBottom: 6},
  input: {
    minHeight: MIN_TOUCH, borderWidth: 2, borderColor: c.line, borderRadius: 8,
    paddingHorizontal: 12, fontSize: 18, color: c.ink, backgroundColor: c.paper,
  },
  inputBad: {borderColor: c.red},
  help: {fontSize: 14, color: c.muted, marginTop: 4},
  error: {fontSize: 14, color: c.red, fontWeight: '600', marginTop: 4},
  button: {
    minHeight: MIN_TOUCH, backgroundColor: c.blue, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  buttonText: {color: '#fff', fontSize: 18, fontWeight: '700'},
  ok: {marginTop: 16, fontSize: 16, color: c.green, fontWeight: '600'},
});
