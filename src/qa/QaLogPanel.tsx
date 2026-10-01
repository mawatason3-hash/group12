// Member 4: on-screen QA log (development builds only).
// Lets the tester copy the log into the test-log document via the Share sheet.
import React, {useSyncExternalStore} from 'react';
import {Pressable, ScrollView, Share, StyleSheet, Text, View} from 'react-native';
import {c, MIN_TOUCH} from '../theme';
import {clearLog, formatLog, getEntries, subscribe} from './eventLog';

export function QaLogPanel({onClose}: {onClose: () => void}) {
  const entries = useSyncExternalStore(subscribe, getEntries);

  async function shareLog() {
    try {
      await Share.share({title: 'Camera QA log', message: formatLog()});
    } catch {
      // Sharing is optional; ignore if the user closes the sheet.
    }
  }

  return (
    <View style={s.overlay} accessibilityViewIsModal>
      <View style={s.sheet}>
        <Text style={s.title} accessibilityRole="header">QA event log ({entries.length})</Text>
        <ScrollView style={s.list}>
          {entries.length === 0 ? (
            <Text style={s.empty}>No events yet. Use the camera, then reopen this log.</Text>
          ) : (
            [...entries].reverse().map((e, i) => (
              <Text key={`${e.time}-${i}`} style={s.line}>
                {e.time}  <Text style={s.evt}>{e.event}</Text>
                {e.detail ? `  ${e.detail}` : ''}
              </Text>
            ))
          )}
        </ScrollView>
        <View style={s.row}>
          <Btn label="Share log" onPress={shareLog} />
          <Btn label="Clear" onPress={clearLog} />
          <Btn label="Close" onPress={onClose} primary />
        </View>
      </View>
    </View>
  );
}

function Btn({label, onPress, primary}: {label: string; onPress: () => void; primary?: boolean}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={[s.btn, primary && s.btnP]}>
      <Text style={[s.btnT, primary && {color: '#fff'}]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,31,46,0.6)', justifyContent: 'flex-end'},
  sheet: {backgroundColor: c.paper, padding: 16, maxHeight: '75%', borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 10},
  title: {fontSize: 18, fontWeight: '700', color: c.ink},
  list: {minHeight: 120},
  empty: {fontSize: 14, color: c.muted},
  line: {fontSize: 13, color: c.ink, paddingVertical: 3, fontFamily: 'monospace'},
  evt: {fontWeight: '700', color: c.blue},
  row: {flexDirection: 'row', gap: 8},
  btn: {flex: 1, minHeight: MIN_TOUCH, borderRadius: 8, borderWidth: 2, borderColor: c.blue, alignItems: 'center', justifyContent: 'center'},
  btnP: {backgroundColor: c.blue},
  btnT: {fontSize: 15, fontWeight: '700', color: c.blue},
});
