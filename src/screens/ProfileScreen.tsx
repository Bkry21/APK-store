import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth.store';
import { colors, spacing, radius, typography, shadows } from '../theme/index';
import { useEffect } from 'react';
import { useFavoritesStore } from '../store/favorites.store';

export default function ProfileScreen({ navigation }: any) {
 const { user, logout } = useAuthStore((s: any) => s);
const { favorites, fetchFavorites } = useFavoritesStore();

useEffect(() => {
  if (user) fetchFavorites();
}, [user]);
  const isAdmin  = user?.role === 'ADMIN';
  const initials = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header Card ── */}
        <View style={styles.headerCard}>

          {user ? (
            <>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>

              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Feather name="shield" size={11} color={colors.primary} />
                  <Text style={styles.adminBadgeText}>مدير المتجر</Text>
                </View>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>٠</Text>
                  <Text style={styles.statLabel}>طلب</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
  <Text style={styles.statValue}>{favorites.length}</Text>
  <Text style={styles.statLabel}>محفوظ</Text>
</View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>٠</Text>
                  <Text style={styles.statLabel}>مراجعة</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.guestIcon}>
                <Feather name="user" size={36} color={colors.textMuted} />
              </View>
              <Text style={styles.name}>مرحباً بك</Text>
              <Text style={styles.email}>سجّل دخولك للوصول لحسابك</Text>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Admin Section ── */}
        {user && isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الإدارة</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon="layout"
                label="لوحة التحكم"
                onPress={() => navigation.navigate('AdminHome')}
                iconBg={colors.primaryLight}
                iconColor={colors.primary}
              />
              <MenuItem
                icon="box"
                label="إدارة المنتجات"
                onPress={() => navigation.navigate('AdminProducts')}
                iconBg={colors.primaryLight}
                iconColor={colors.primary}
                last
              />
            </View>
          </View>
        )}

        {/* ── Account Section ── */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الحساب</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon="package"
                label="طلباتي"
                sublabel="تتبع وإدارة طلباتك"
                onPress={() => navigation.navigate('Orders')}
                iconBg="#EEF2FF"
                iconColor="#6366F1"
              />
              <MenuItem
                icon="heart"
                label="المفضلة"
                sublabel="المنتجات المحفوظة"
                onPress={() => navigation.navigate('Favorites')}
                iconBg="#FFF0F0"
                iconColor="#F87171"
              />
              <MenuItem
                icon="map-pin"
                label="عناويني"
                sublabel="إدارة عناوين التوصيل"
                onPress={() => navigation.navigate('Address')}
                iconBg="#F0FDF4"
                iconColor="#4ADE80"
                last
              />
            </View>
          </View>
        )}

        {/* ── Support Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المساعدة</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle"
              label="الدعم والمساعدة"
              onPress={() => {}}
              iconBg={colors.accentLight}
              iconColor={colors.accent}
            />
            <MenuItem
              icon="info"
              label="عن التطبيق"
              onPress={() => {}}
              iconBg={colors.accentLight}
              iconColor={colors.accent}
              last
            />
          </View>
        </View>

        {/* ── Logout ── */}
        {user && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={18} color={colors.error} />
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>الإصدار 1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, sublabel, onPress, iconBg, iconColor, last }: any) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={17} color={iconColor} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <Feather name="chevron-left" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: { paddingBottom: 100 },

  headerCard: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },

  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: colors.white },

  guestIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.borderLight,
  },

  name:  { ...typography.h3, color: colors.text, marginBottom: 4 },
  email: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.sm },

  loginBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    ...shadows.sm,
  },
  loginBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: spacing.md,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },

  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    width: '100%',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statValue:   { ...typography.h3, color: colors.text },
  statLabel:   { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.borderLight },

  section: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionTitle: {
    ...typography.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: { flex: 1, alignItems: 'flex-end' },
  menuLabel:   { ...typography.body, fontWeight: '600', color: colors.text },
  menuSublabel:{ ...typography.tiny, color: colors.textMuted, marginTop: 2 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error + '30',
    backgroundColor: colors.error + '08',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.error },

  version: {
    textAlign: 'center',
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});