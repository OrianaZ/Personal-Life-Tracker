//general
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

//context
import { FastingProvider } from '@/components/context/FastingContext';
import { MealsProvider } from '@/components/context/MealsContext';
import { MedsProvider } from '@/components/context/MedsContext';
import { WaterProvider } from '@/components/context/WaterContext';


export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme} >
      <FastingProvider>
        <MealsProvider>
          <MedsProvider>
            <WaterProvider>

              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
              {/* <NotificationsManager /> */}

            </WaterProvider>
          </MedsProvider>
        </MealsProvider>
      </FastingProvider>
    </ThemeProvider>
  );
}
