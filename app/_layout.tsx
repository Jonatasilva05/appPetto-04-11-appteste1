// app/_layout.tsx

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    ...FontAwesome.font,
  });

  const { isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && !isAuthLoading) {
      SplashScreen.hideAsync();

      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('hidden');
        NavigationBar.setBehaviorAsync('inset-swipe');
      }
    }
  }, [fontsLoaded, isAuthLoading]);

  if (!fontsLoaded || isAuthLoading) {
    return null;
  }

  
  return (
    <ThemeProvider>
      <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="conta" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="cadastrarPet" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="editarPet" options={{ title: 'Editar Pet', presentation: 'modal' }} />
      <Stack.Screen name="recuperarSenha" options={{ headerShown: false }} />
      <Stack.Screen name="verificarResposta" options={{ headerShown: false }} />
      <Stack.Screen name="redefinirSenha" options={{ headerShown: false }} />
    </Stack>
    </ThemeProvider>
  );
}
