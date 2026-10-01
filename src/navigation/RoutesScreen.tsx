import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenHeader} from '../components/ScreenHeader';
import {useInspectionRecords} from '../screens/InspectionForm';
import type {RecordsStackParamList} from './types';
import {appShadow, c} from '../theme';

type Props = NativeStackScreenProps<RecordsStackParamList, 'RecordsList'>;

export function RoutesScreen({navigation}: Props) {
  const {records} = useInspectionRecords();

  if (records.length === 0) {
    return (
      <View style={styles.page}>
        <ScreenHeader title="Records" />
        <Text style={styles.title}>No inspection records yet. Save an inspection and it will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScreenHeader title="Records" />
      <FlatList
        data={records}
        keyExtractor={record => record.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open inspection record for ${item.vendorAlias}`}
            style={styles.card}
            onPress={() => navigation.navigate('InspectionDetails', {recordId: item.id})}
          >
            <Text style={styles.cardTitle}>{item.vendorAlias}</Text>
            <Text style={styles.text}>{item.stallCode} | Risk: {item.risk}</Text>
            <Text style={styles.meta}>{item.savedAt}</Text>
          </Pressable>
        )}
      />
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
  listContent: {
    paddingTop: 10,
    paddingBottom: 120,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: c.ink,
    marginTop: 10,
    lineHeight: 28,
  },
  text: {
    fontSize: 14,
    color: c.ink,
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: c.muted,
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 16,
    padding: 14,
    backgroundColor: c.card,
    ...appShadow,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: c.ink,
  },
});
