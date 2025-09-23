//general
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

//theme
import { HapticTab } from '@/components/functional/HapticTab';
import { Colors } from '@/components/theme/Colors';
import TabBarBackground from '@/components/theme/TabBarBackground';

//functions
import ScreenWrapper from "@/components/theme/screenWrapper";


export default function TabLayout() {

  return (
    <ScreenWrapper>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="fasting"
            options={{
              title: "Fasting",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="meals"
            options={{
              title: "Meals",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="restaurant-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="water"
            options={{
              title: "Water",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="water" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="activity"
            options={{
              title: "Activity",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="walk-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="meds"
            options={{
              title: "Meds",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="medkit" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="overview"
            options={{
              title: "Overview",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bar-chart-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
        
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
}
