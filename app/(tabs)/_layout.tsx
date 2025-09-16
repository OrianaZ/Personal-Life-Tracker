import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import ScreenWrapper from "@/components/screenWrapper";
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { FastingProvider } from "@/context/FastingContext";
import { MealsProvider } from '@/context/MealsContext';
import { MedsProvider } from '@/context/MedsContext';
import { WaterProvider } from "@/context/WaterContext";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {

  return (
    <ScreenWrapper>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <WaterProvider>
      <MedsProvider>
      <MealsProvider>
      <FastingProvider>
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
        </Tabs>
        
      </FastingProvider>
      </MealsProvider>
      </MedsProvider>
      </WaterProvider>
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
}
