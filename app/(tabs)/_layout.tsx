// app/(tabs)/_layout.tsx

import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'; 
import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons, FontAwesome, Foundation, Feather } from '@expo/vector-icons';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth, API_BASE_URL } from '@/app/context/AuthContext';

function CustomHeaderTitle({ title, isDark }: { title: string, isDark: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('@/assets/imagess/logo/iconBrancaSemFundoSemNome.png')}
        style={{ width: 45, height: 45 }}
        resizeMode="contain"
      />
      <View style={{ marginLeft: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#FFFFFF' }}>
          Petto
        </Text>
        <Text style={{ fontSize: 12, color: isDark ? '#dfdfdfff' : '#dfdfdfff' }}>{title}</Text>
      </View>
    </View>
  );
}

// --- ÍCONE DE PERFIL ---
const UserProfileIcon = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { colors } = useTheme();

    return (
        <TouchableOpacity onPress={() => router.push('/conta')} style={{ marginRight: 15 }}>
            {user?.foto_url ? (
                <Image
                    source={{ uri: `${API_BASE_URL}${user.foto_url}` }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                />
            ) : (
                <Ionicons name="person-circle-outline" size={32} color={colors.text} />
            )}
        </TouchableOpacity>
    );
};


const CustomTabBar = (props: any) => {
  const { colors } = useTheme();
  const tabWidth = props.state.routes.length > 0 ? Dimensions.get('window').width / props.state.routes.length : 0;
  const activeTab = props.state.index;
  const translateX = useSharedValue(activeTab * tabWidth);

  useEffect(() => {
    translateX.value = withTiming(activeTab * tabWidth, { duration: 250 });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const activeColor = colors.primary;
  const inactiveColor = colors.subtitle;

  return (
    <View style={{ flexDirection: 'row', height: 80, backgroundColor: colors.tabBar }}>
      <Animated.View style={[ { position: 'absolute', top: 10, width: tabWidth, alignItems: 'center', justifyContent: 'center' }, indicatorStyle ]}>
        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: activeColor, opacity: 0.8 }} />
      </Animated.View>

      {props.state.routes.map((route: any, index: number) => {
        const { options } = props.descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = props.state.index === index;
        const onPress = () => {
          const event = props.navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            props.navigation.navigate(route.name, route.params);
          }
        };
        const IconComponent = options.tabBarIcon;
        const color = isFocused ? colors.text : inactiveColor;
        return (
          <TouchableOpacity key={index} onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            {IconComponent && <IconComponent focused={isFocused} color={color} size={30} />}
            <Text style={{ color, fontSize: 12, marginTop: 4 }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.header, height: 100 },
        headerTintColor: colors.text,
        headerRight: () => <UserProfileIcon />,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerTitle: () => <CustomHeaderTitle title="Página Inicial " isDark={isDark} />,
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vacinacao"
        options={{
          title: 'Carteira',
          headerTitle: () => <CustomHeaderTitle title="Carteira de Vacinação " isDark={isDark} />,
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="needle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contato"
        options={{
          title: 'Contato',
          headerTitle: () => <CustomHeaderTitle title="Fale Conosco" isDark={isDark} />,
          tabBarIcon: ({ color, size }) => <Foundation name="telephone" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config.',
          headerTitle: () => <CustomHeaderTitle title="Configurações" isDark={isDark} />,
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}