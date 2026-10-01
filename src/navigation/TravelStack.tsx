import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RouteDetailScreen} from './DetailScreen';
import {RoutesScreen} from './RoutesScreen';
import type {RecordsStackParamList} from './types';
import {c} from '../theme';

const Stack = createNativeStackNavigator<RecordsStackParamList>();

export function RecordsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: c.shell},
      }}
    >
      <Stack.Screen name="RecordsList" component={RoutesScreen} />
      <Stack.Screen name="InspectionDetails" component={RouteDetailScreen} />
    </Stack.Navigator>
  );
}

export const TravelStack = RecordsStack;
