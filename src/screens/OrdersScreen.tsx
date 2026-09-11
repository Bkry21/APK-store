import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
  Modal, Image, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getUserOrders } from '../services/orders.service';
import { colors, spacing, radius, shadows } from '../theme/index';

// إعدادات حالات الطلب
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  PENDING:   { label: 'قيد الانتظار', bg: '#FFF7ED', color: '#EA580C', icon: 'clock' },
  CONFIRMED: { label: 'تم التأكيد',   bg: '#E0F2FE', color: '#0284C7', icon: 'check-circle' },
  SHIPPED:   { label: 'في الطريق',    bg: '#F3E8FF', color: '#9333EA', icon: 'truck' },
  DELIVERED: { label: 'تم التوصيل',   bg: '#DCFCE7', color: '#16A34A', icon: 'package' },
  CANCELLED: { label: 'ملغي',         bg: '#FEE2E2', color: '#DC2626', icon: 'x-circle' },
};

export default function OrdersScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // حالة التحكم بالمودال والطلب المختار
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getUserOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleCloseDetails = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // الحصول على شارة الحالة الحالية للطلب المحدد
  const selectedStatus = selectedOrder ? (STATUS_CONFIG[selectedOrder.status] ?? {
    label: selectedOrder.status, bg: '#F3F4F6', color: colors.textSecondary, icon: 'circle'
  }) : null;

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-right" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>طلباتي</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* قائمة الطلبات */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status] ?? {
            label: item.status, 
            bg: '#F3F4F6', 
            color: colors.textSecondary, 
            icon: 'circle',
          };

          const formattedDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'تاريخ غير محدد';

          return (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.85}
              onPress={() => handleOpenDetails(item)}
            >
              {/* Card Top: Status & Order ID */}
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <Feather name={status.icon} size={12} color={status.color} />
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>

                <View style={styles.orderIdContainer}>
                  <Text style={styles.orderIdLabel}>رقم الطلب</Text>
                  <Text style={styles.orderIdValue}>#{item.id?.slice(0, 8)}</Text>
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardBody}>
                <View style={styles.infoPill}>
                  <Feather name="calendar" size={13} color={colors.textMuted} />
                  <Text style={styles.infoText}>{formattedDate}</Text>
                </View>

                <View style={styles.infoPill}>
                  <Feather name="shopping-bag" size={13} color={colors.textMuted} />
                  <Text style={styles.infoText}>{item.items?.length ?? 0} منتجات</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.detailsBtnHint}>
                  <Text style={styles.detailsBtnText}>عرض التفاصيل</Text>
                  <Feather name="chevron-left" size={16} color={colors.primary} />
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.currency}>ر.س</Text>
                  <Text style={styles.totalPrice}>
                    {Number(item.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Feather name="package" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>لا توجد طلبات سابقة</Text>
            <Text style={styles.emptySubtitle}>
              لم تقومي بإجراء أي طلب بعد. استكشفي المنتجات وأضيفي ما يعجبك إلى السلة!
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Main', { screen: 'Home' })}
            >
              <Feather name="compass" size={18} color={colors.white} />
              <Text style={styles.shopBtnText}>تصفح المنتجات الآن</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ── مودال عرض تفاصيل الطلب والمنتجات ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseDetails} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>تفاصيل الطلب #{selectedOrder?.id?.slice(0, 8)}</Text>
              <View style={{ width: 32 }} />
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* حالة الطلب والتاريخ */}
                <View style={styles.modalStatusBox}>
                  {selectedStatus && (
                    <View style={[styles.statusBadge, { backgroundColor: selectedStatus.bg }]}>
                      <Feather name={selectedStatus.icon} size={12} color={selectedStatus.color} />
                      <Text style={[styles.statusText, { color: selectedStatus.color }]}>
                        {selectedStatus.label}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.modalDateText}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </Text>
                </View>

                {/* قائمة المنتجات مع الصور */}
                <Text style={styles.sectionLabel}>المنتجات ({selectedOrder.items?.length ?? 0})</Text>
                <View style={styles.itemsList}>
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const product = item.product || {};
                    // جلب الصورة الأولى أو إظهار صورة افتراضية
                    const imageUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/150';

                    return (
                      <View key={item.id || idx} style={styles.productRow}>
                        <Image source={{ uri: imageUrl }} style={styles.productImage} />
                        <View style={styles.productDetails}>
                          <Text style={styles.productName} numberOfLines={2}>
                            {product.name || 'منتج غير معروف'}
                          </Text>
                          <Text style={styles.productMeta}>
                            الكمية: {item.quantity} × {Number(item.price ?? product.price ?? 0).toFixed(2)} ر.س
                          </Text>
                        </View>
                        <Text style={styles.productTotal}>
                          {(Number(item.quantity) * Number(item.price ?? product.price ?? 0)).toFixed(2)} ر.س
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* معلومات العنوان إن وجدت */}
                {selectedOrder.address && (
                  <>
                    <Text style={styles.sectionLabel}>عنوان التوصيل</Text>
                    <View style={styles.addressCard}>
                      <Feather name="map-pin" size={16} color={colors.primary} />
                      <Text style={styles.addressText}>
                        {selectedOrder.address.street}، {selectedOrder.address.city}
                      </Text>
                    </View>
                  </>
                )}

                {/* الملخص المالي */}
                <Text style={styles.sectionLabel}>ملخص الحساب</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryVal}>
                      {Number(selectedOrder.total ?? 0).toFixed(2)} ر.س
                    </Text>
                    <Text style={styles.summaryKey}>إجمالي المنتجات</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryVal}>مجاني</Text>
                    <Text style={styles.summaryKey}>التوصيل</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalVal}>
                      {Number(selectedOrder.total ?? 0).toFixed(2)} ر.س
                    </Text>
                    <Text style={styles.summaryTotalKey}>المبلغ الإجمالي</Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC' 
  },
  list: { 
    padding: spacing.md, 
  },

  /* Header */
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...shadows.sm,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: colors.text 
  },
  backBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerRightPlaceholder: { 
    width: 36 
  },

  /* Card Layout */
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderIdContainer: {
    alignItems: 'flex-start',
  },
  orderIdLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  orderIdValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: '700' 
  },

  /* Card Body */
  cardBody: { 
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  infoPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  infoText: { 
    fontSize: 12, 
    color: colors.textSecondary,
    fontWeight: '600',
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.sm,
  },

  /* Card Footer */
  cardFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsBtnHint: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  detailsBtnText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalPrice: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: colors.text 
  },
  currency: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  /* Empty State */
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  emptyIconWrapper: {
    width: 80, 
    height: 80, 
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: colors.text, 
    marginBottom: spacing.xs 
  },
  emptySubtitle: { 
    fontSize: 13, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: 20,
    marginBottom: spacing.xl 
  },
  shopBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.full,
    ...shadows.md,
  },
  shopBtnText: { 
    color: colors.white, 
    fontWeight: '700', 
    fontSize: 14 
  },

  /* Modal Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingVertical: spacing.md,
  },
  modalStatusBox: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalDateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  /* Products List in Modal */
  itemsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  productRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: '#E2E8F0',
  },
  productDetails: {
    flex: 1,
    marginRight: spacing.sm,
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  productMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  productTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginLeft: spacing.xs,
  },

  /* Address Card in Modal */
  addressCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  /* Financial Summary */
  summaryCard: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryKey: {
    fontSize: 12,
    color: colors.textMuted,
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  summaryTotalKey: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  summaryTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
});