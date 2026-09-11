import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProductScreen from '../screens/ProductScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminAddProductScreen from '../screens/admin/AdminAddProductScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AddressScreen from '../screens/address';
import AdminBannersScreen from '../screens/admin/AdminBannersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

import { useAuthStore } from '../store/auth.store';
import { colors, radius, shadows, spacing } from '../theme/index';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabs = [
  { name: 'Home', label: 'الرئيسية', icon: 'home' },
  { name: 'Orders', label: 'طلباتي', icon: 'package' },
  { name: 'Favorites', label: 'المفضلة', icon: 'heart' },
  { name: 'Cart', label: 'السلة', icon: 'shopping-cart' },
  { name: 'Profile', label: 'حسابي', icon: 'user' },
];

function TabItem({ route, index, state, navigation }: any) {
  const tab = tabs.find((t) => t.name === route.name);
  const focused = state.index === index;

  const animation = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: focused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  // الخلفية عند التحديد مربوطة بالثيم
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.white || '#FFFFFF'],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(route.name)}
      activeOpacity={0.7}
      style={styles.tabItemTouchable}
    >
      <Animated.View style={[styles.tabItem, { backgroundColor, transform: [{ scale }] }]}>
        <Feather
          name={tab?.icon as any}
          size={focused ? 20 : 24} // زيادة حجم الأيقونات
          color={focused ? (colors.primary || '#1A1A1A') : colors.textMuted || '#9CA3AF'}
        />
        {focused && (
          <Animated.Text style={[styles.tabLabel, { opacity: animation }]}>
            {tab?.label}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => (
          <TabItem
            key={route.name}
            route={route}
            index={index}
            state={state}
            navigation={navigation}
          />
        ))}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white || '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight || '#E5E7EB',
        },
        headerTintColor: colors.text || '#1A1A1A',
        headerTitleStyle: { fontSize: 16, fontWeight: 'bold' },
        cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        transitionSpec: {
          open: { animation: 'timing', config: { duration: 250 } },
          close: { animation: 'timing', config: { duration: 200 } },
        },
      }}
    >
      {/* ── Main Tabs ── */}
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />

      {/* ── Auth ── */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

      {/* ── App Screens ── */}
      <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'إتمام الطلب' }} />
      <Stack.Screen name="Address" component={AddressScreen} options={{ headerShown: false }} />

      {/* ── Admin ── */}
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminAddProduct" component={AdminAddProductScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminBanners" component={AdminBannersScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: '3%',
    right: '3%',
    alignItems: 'center',
    zIndex: 99,
  },
  tabBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.text || '#1A1A1A',
    borderRadius: radius.full || 32,
    paddingHorizontal: spacing.sm || 10,
    paddingVertical: spacing.sm || 12, // زيادة الارتفاع الرأسي لشريط التنقل
    minHeight: 64, // تحديد حد أدنى للارتفاع لجعل الشريط أعرض وأكثر راحة
    ...shadows.lg,
  },
  tabItemTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10, // زيادة التباعد الداخلي للزر المكتمل
    borderRadius: radius.full || 24,
    gap: 8,
  },
  tabLabel: {
    fontSize: 13, // زيادة حجم خط اسم التبويب
    fontWeight: '800',
    color: colors.primary || '#1A1A1A',
  },
});