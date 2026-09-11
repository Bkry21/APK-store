import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, typography } from '../../theme';

const options = [
  { title: 'إدارة المنتجات', screen: 'AdminProducts', icon: 'box', count: null },
  { title: 'إدارة الفئات', screen: 'AdminCategories', icon: 'grid', count: null },
  { title: 'إدارة الطلبات', screen: 'AdminOrders', icon: 'clipboard', count: null },
  { title: 'إدارة البنرات', screen: 'AdminBanners', icon: 'image', count: null },
];

export default function AdminHomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>مرحباً بك</Text>
          <Text style={styles.title}>لوحة التحكم</Text>
        </View>

        {/* Cards */}
        <View style={styles.grid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.screen}
              style={styles.card}
              onPress={() => navigation.navigate(opt.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <Feather name={opt.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={styles.cardText}>{opt.title}</Text>
              <Feather name="chevron-left" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  header: { marginBottom: spacing.xl },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  title: { ...typography.h2, color: colors.text, textAlign: 'right' },

  grid: { gap: spacing.sm },
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrapper: {
    width: 44, height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  cardText: {
    flex: 1,
    fontSize: 15, fontWeight: '600',
    color: colors.text, textAlign: 'right',
  },
});