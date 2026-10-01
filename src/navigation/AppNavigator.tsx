import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MarketCatalog} from '../screens/MarketCatalog';
import {NewInspectionStack} from '../screens/InspectionForm';
import {RecordsStack} from './TravelStack';
import type {RootTabParamList} from './types';
import {c} from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  NewInspection: 'clipboard',
  Records: 'folder-open',
};

export function AppNavigator() {
  return (
    <NavigationContainer>
      <View style={styles.appShell}>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({route}) => ({
            headerShown: false,
            lazy: true,
            tabBarActiveTintColor: '#8ED1FF',
            tabBarInactiveTintColor: '#A5B7CC',
            tabBarStyle: {
              backgroundColor: '#0B1B2A',
              borderTopWidth: 0,
              borderRadius: 22,
              height: 78,
              marginBottom: 12,
              marginHorizontal: 12,
              paddingTop: 8,
              paddingBottom: 10,
              paddingHorizontal: 10,
              shadowColor: '#000000',
              shadowOffset: {width: 0, height: 8},
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
              marginTop: 4,
              letterSpacing: 0.2,
            },
            tabBarIconStyle: {
              marginTop: 2,
            },
            tabBarItemStyle: {
              minHeight: 44,
              borderRadius: 16,
            },
            tabBarIcon: ({focused, color, size}) => (
              <Ionicons
                name={ICONS[route.name as keyof RootTabParamList] ?? 'radio-button-off'}
                size={size}
                color={focused ? '#8ED1FF' : color}
              />
            ),
          })}
        >
          <Tab.Screen name="Home" component={MarketCatalog} options={{tabBarLabel: 'Home'}} />
          <Tab.Screen
            name="NewInspection"
            component={NewInspectionStack}
            initialParams={{stallCode: undefined}}
            options={{tabBarLabel: 'New Inspection'}}
          />
          <Tab.Screen name="Records" component={RecordsStack} options={{tabBarLabel: 'Records'}} />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: c.shell,
  },
});
