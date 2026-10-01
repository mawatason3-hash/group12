import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {InspectionRecordsProvider} from './src/screens/InspectionForm';

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <InspectionRecordsProvider>
          <AppNavigator />
        </InspectionRecordsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
