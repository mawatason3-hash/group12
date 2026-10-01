import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenHeader} from '../components/ScreenHeader';
import {GROUP_CODE} from '../constants/group';
import {useInspectionRecords} from '../screens/InspectionForm';
import type {RecordsStackParamList} from './types';
import {appShadow, c} from '../theme';

type Props = NativeStackScreenProps<RecordsStackParamList, 'InspectionDetails'>;

export function RouteDetailScreen({route}: Props) {
  const {records} = useInspectionRecords();
  const record = records.find(item => item.id === route.params.recordId);

  if (!record) {
    return (
      <View style={styles.page}>
        <ScreenHeader title="Inspection details" />
        <Text style={styles.title}>Record not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScreenHeader title="Inspection details" />
      <View style={styles.card}>
        <Text style={styles.title}>{record.vendorAlias}</Text>
        <Text style={styles.line}>Stall code: {record.stallCode}</Text>
        <Text style={styles.line}>Category: {record.category}</Text>
        <Text style={styles.line}>Contact: {record.phone}</Text>
        <Text style={styles.line}>Risk level: {record.risk}</Text>
        <Text style={styles.line}>Recorded: {record.savedAt}</Text>
        <Text style={styles.line}>Group verification code: {GROUP_CODE}</Text>
        {record.imageUri ? (
          <Image source={{uri: record.imageUri}} style={styles.image} resizeMode="cover" accessibilityLabel="Inspection photo" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: c.shell,
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.line,
    padding: 18,
    ...appShadow,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    color: c.ink,
  },
  line: {
    marginBottom: 10,
    fontSize: 15,
    color: c.ink,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    minHeight: 180,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: c.surface,
  },
});
