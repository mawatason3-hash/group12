import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {type BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {AnimatedPressable} from '../components/AnimatedPressable';
import {ScreenHeader} from '../components/ScreenHeader';
import {GROUP_CODE, GROUP_NUMBER, LEADER, MEMBERS} from '../constants/group';
import {c} from '../theme';
import {MARKET_ZONES, type MarketZone} from '../navigation/data';
import type {RootTabParamList} from '../navigation/types';

const STATUS_FILTERS = ['All', 'Open', 'Attention', 'Closed'] as const;

const statusColors: Record<MarketZone['status'], {bg: string; fg: string}> = {
  Open: {bg: '#DCE8E2', fg: '#1B4D3E'},
  Attention: {bg: '#F3E0D8', fg: '#9A4A32'},
  Closed: {bg: '#F0DCDC', fg: '#7A3A3A'},
};

const priorityColors: Record<MarketZone['priority'], string> = {
  High: '#7A3A3A',
  Medium: '#9A4A32',
  Low: '#1B4D3E',
};

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

export function MarketCatalog({navigation}: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('All');
  const [showEmpty, setShowEmpty] = useState(false);

  const filtered = useMemo(() => {
    if (showEmpty) return [];
    const q = query.trim().toLowerCase();
    return MARKET_ZONES.filter(zone => {
      const matchesQuery =
        !q ||
        zone.name.toLowerCase().includes(q) ||
        zone.stallCode.toLowerCase().includes(q) ||
        zone.category.toLowerCase().includes(q);
      const matchesStatus = status === 'All' || zone.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, showEmpty, status]);

  const handleUseStall = (code: string) => {
    navigation.navigate('NewInspection', {stallCode: code});
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Home" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterPanel}>
          <Text style={styles.label}>Search zones</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Name, stall code or category"
            accessibilityRole="search"
            accessibilityLabel="Search zones"
            style={styles.input}
          />

          <View style={styles.filterRow}>
            {STATUS_FILTERS.map(current => {
              const active = status === current;
              return (
                <Pressable
                  key={current}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${current}`}
                  onPress={() => setStatus(current)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{current}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => setShowEmpty(value => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{checked: showEmpty}}
            style={styles.emptyToggle}
          >
            <View style={[styles.toggleBox, showEmpty && styles.toggleBoxActive]} />
            <Text style={styles.toggleLabel}>Show empty catalogue (assessor empty-state check)</Text>
          </Pressable>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No assigned zones</Text>
            <Text style={styles.emptyText}>
              Nothing matches this search. Clear the query and status filter to see the six Musanze stalls again.
            </Text>
            <Pressable
              onPress={() => {
                setQuery('');
                setStatus('All');
                setShowEmpty(false);
              }}
              style={styles.emptyButton}
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
            >
              <Text style={styles.emptyButtonText}>Clear filters</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.catalogList}>
            {filtered.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(Math.min(index * 50, 220)).duration(260)}
                style={styles.zoneItem}
              >
                <StallCard zone={item} onUseStall={handleUseStall} />
              </Animated.View>
            ))}
          </View>
        )}

        <AboutPrototypeCard />
      </ScrollView>
    </View>
  );
}

function AboutPrototypeCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.aboutWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse about this prototype' : 'Expand about this prototype'}
        onPress={() => setExpanded(value => !value)}
        style={styles.aboutToggle}
      >
        <Text style={styles.aboutTitle}>About this prototype</Text>
        <Text style={styles.aboutChevron}>{expanded ? '−' : '+'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.aboutBody}>
          <Text style={styles.aboutText}>Group {GROUP_NUMBER}</Text>
          <Text style={styles.aboutText}>Group verification code: {GROUP_CODE}</Text>
          <Text style={styles.aboutText}>Leader: {LEADER.name} ({LEADER.regNo})</Text>
          {MEMBERS.map(member => (
            <Text key={member.id} style={styles.aboutText}>
              {member.id}: {member.role}: {member.name} ({member.regNo})
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function StallCard({zone, onUseStall}: {zone: MarketZone; onUseStall: (code: string) => void}) {
  const statusStyle = statusColors[zone.status];

  return (
    <AnimatedPressable
      style={styles.zoneCard}
      accessibilityRole="button"
      accessibilityLabel={`${zone.name}, ${zone.category}, status ${zone.status}`}
    >
      <View style={[styles.zoneImage, {backgroundColor: zone.tint}]}> 
        <Text style={styles.zoneLetter}>{zone.name.charAt(0)}</Text>
        <Text style={styles.zoneCode}>{zone.stallCode}</Text>
      </View>

      <View style={styles.zoneBody}>
        <Text style={styles.zoneName}>{zone.name}</Text>
        <Text style={styles.zoneCategory}>{zone.category}</Text>
        <Text style={styles.zoneSummary}>{zone.summary}</Text>

        <View style={styles.chipRow}>
          <View style={[styles.statusChip, {backgroundColor: statusStyle.bg}]}> 
            <Text style={[styles.statusChipText, {color: statusStyle.fg}]}>{zone.status}</Text>
          </View>
          <View style={styles.priorityChip}>
            <Text style={[styles.priorityChipText, {color: priorityColors[zone.priority]}]}>{zone.priority} priority</Text>
          </View>
        </View>

        <Pressable
          onPress={() => onUseStall(zone.stallCode)}
          style={styles.useButton}
          accessibilityRole="button"
          accessibilityLabel={`Use stall ${zone.stallCode}`}
        >
          <Text style={styles.useButtonText}>Use stall {zone.stallCode}</Text>
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#050d1a',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#050d1a',
  },
  content: {
    paddingTop: 8,
    paddingBottom: 120,
    gap: 20,
  },
  filterPanel: {
    backgroundColor: 'rgba(14,22,35,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#eef2ff',
    marginTop: 4,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  filterLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '700',
  },
  filterLabelActive: {
    color: '#FFF9F2',
  },
  emptyToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  toggleBox: {
    width: 18,
    height: 18,
    marginTop: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  toggleBoxActive: {
    backgroundColor: '#1B4D3E',
    borderColor: '#1B4D3E',
  },
  toggleLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.72)',
    flex: 1,
  },
  emptyCard: {
    backgroundColor: 'rgba(14,22,35,0.8)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 24,
  },
  emptyButton: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1B4D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  aboutWrap: {
    backgroundColor: 'rgba(14,22,35,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  aboutToggle: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aboutTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  aboutChevron: {
    color: '#8ED1FF',
    fontSize: 26,
    fontWeight: '700',
    minWidth: 22,
    textAlign: 'center',
  },
  aboutBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  aboutText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 22,
    flexShrink: 1,
  },
  catalogList: {
    gap: 12,
  },
  zoneItem: {
    width: '100%',
  },
  zoneCard: {
    backgroundColor: '#fffaf4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7DCCD',
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 145,
  },
  zoneImage: {
    width: 120,
    minHeight: 145,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  zoneLetter: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
  },
  zoneCode: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  zoneBody: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  zoneName: {
    color: '#0b1b2b',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  zoneCategory: {
    color: '#4B5D73',
    fontSize: 13,
    fontWeight: '700',
  },
  zoneSummary: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  priorityChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  useButton: {
    minHeight: 44,
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#0B1B2B',
    justifyContent: 'center',
  },
  useButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});