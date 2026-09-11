import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notifications.service';
import { colors, spacing, radius, typography, shadows } from '../theme/index';

const TYPE_ICONS: Record<string, any> = {
  ORDER_STATUS:  { icon: 'package',     bg: '#EEF2FF', color: '#4F46E5' },
  PRODUCT_ADD:   { icon: 'tag',         bg: '#F0FDF4', color: '#16A34A' },
  BANNER_ADD:    { icon: 'image',       bg: '#FFF7ED', color: '#EA580C' },
  CART_REMINDER: { icon: 'shopping-cart', bg: '#FDF4FF', color: '#A21CAF' },
  GENERAL:       { icon: 'bell',        bg: '#F8FAFC', color: '#475569' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>تعليم الكل كمقروء</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.center}>
          <Feather name="bell-off" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>لا توجد إشعارات</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />
          }
          renderItem={({ item }) => {
            const meta = TYPE_ICONS[item.type] || TYPE_ICONS.GENERAL;
            return (
              <TouchableOpacity
                style={[styles.card, !item.isRead && styles.cardUnread]}
                onPress={() => !item.isRead && handleRead(item.id)}
                activeOpacity={0.75}
              >
                {/* أيقونة النوع */}
                <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                  <Feather name={meta.icon} size={20} color={meta.color} />
                </View>

                {/* المحتوى */}
                <View style={styles.content}>
                  <Text style={[styles.title, !item.isRead && styles.titleUnread]}>
                    {item.title}
                  </Text>
                  <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>

                {/* نقطة الغير مقروء */}
                {!item.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  headerTitle:  { ...typography.h3, color: colors.text },
  markAllBtn:   { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  markAllText:  { ...typography.small, color: colors.primary, fontWeight: '600' },

  list: { padding: spacing.md, gap: spacing.sm },

  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardUnread: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '06',
  },

  iconBox: {
    width: 42, height: 42, borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center',
  },

  content:      { flex: 1, gap: 3 },
  title:        { ...typography.body, color: colors.textSecondary, fontWeight: '500' },
  titleUnread:  { color: colors.text, fontWeight: '700' },
  body:         { ...typography.small, color: colors.textMuted, lineHeight: 18 },
  time: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },

  emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
});