import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
  Modal, Image, ScrollView, Alert, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../services/api';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusConfig: any = {
  PENDING:   { label: 'قيد الانتظار', bg: '#FFF7ED', color: '#EA580C', icon: 'clock' },
  CONFIRMED: { label: 'تم التأكيد',   bg: '#E0F2FE', color: '#0284C7', icon: 'check-circle' },
  SHIPPED:   { label: 'في الطريق',    bg: '#F3E8FF', color: '#9333EA', icon: 'truck' },
  DELIVERED: { label: 'تم التوصيل',   bg: '#DCFCE7', color: '#16A34A', icon: 'package' },
  CANCELLED: { label: 'ملغي',         bg: '#FEE2E2', color: '#DC2626', icon: 'x-circle' },
};

export default function AdminOrdersScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // حالة المودال وتفاصيل الطلب المختار
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. جلب الطلبات مع معالجة مرنة لاستخراج البيانات
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      
      // معالجة هيكلة الاستجابة سواء كانت Array مباشرة أو داخل كائن
      const data = Array.isArray(res.data) 
        ? res.data 
        : res.data?.orders || res.data?.data || [];

      setOrders(data);
    } catch (error: any) {
      console.error('Fetch Admin Orders Error:', error);
      Alert.alert('خطأ', 'تعذر جلب قائمة الطلبات، تأكد من اتصالك أو صلاحيات الأدمن');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 2. تحديث حالة الطلب
  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      await api.put(`/orders/${id}/status`, { status });
      
      // تحديث الحالة محلياً مباشرة دون الحاجة لإعادة طلب الشبكة بالكامل
      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? { ...ord, status } : ord))
      );

      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev: any) => ({ ...prev, status }));
      }
    } catch (error: any) {
      console.error('Update Status Error:', error);
      Alert.alert('خطأ', 'فشل في تعديل حالة الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E8C" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation?.goBack()}
        >
          <Feather name="arrow-right" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة الطلبات (الأدمن)</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* قائمة الطلبات */}
      <FlatList
        data={orders}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent, 
          { paddingBottom: insets.bottom + 20 }
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchOrders(); }} 
            colors={['#E91E8C']} 
          />
        }
        renderItem={({ item }: any) => {
          const statusInfo = statusConfig[item.status] || {
            label: item.status, bg: '#F3F4F6', color: '#666', icon: 'circle'
          };

          return (
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <TouchableOpacity 
                  style={styles.detailsBtn}
                  onPress={() => handleOpenDetails(item)}
                >
                  <Text style={styles.detailsBtnText}>التفاصيل والصور</Text>
                  <Feather name="chevron-left" size={16} color="#E91E8C" />
                </TouchableOpacity>

                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Feather name={statusInfo.icon} size={12} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>

                <Text style={styles.orderId}>#{item.id?.slice(0, 8)}</Text>
              </View>

              {/* Summary Info */}
              <View style={styles.cardBody}>
                <Text style={styles.customerInfo}>
                  العميل: {item.user?.name || item.user?.email || 'غير معروف'}
                </Text>
                <Text style={styles.total}>
                  الإجمالي: {Number(item.total || 0).toFixed(2)} ر.س
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Status Action Buttons */}
              <Text style={styles.label}>تغيير الحالة السريعة:</Text>
              <View style={styles.statusBtns}>
                {statuses.map((s) => {
                  const isActive = item.status === s;
                  const btnCfg = statusConfig[s];
                  return (
                    <TouchableOpacity
                      key={s}
                      disabled={updatingId === item.id}
                      style={[
                        styles.statusBtn,
                        isActive && { backgroundColor: btnCfg.color, borderColor: btnCfg.color },
                      ]}
                      onPress={() => updateStatus(item.id, s)}
                    >
                      <Text style={[styles.statusBtnText, isActive && styles.statusBtnTextActive]}>
                        {btnCfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#ccc" />
            <Text style={styles.empty}>لا توجد طلبات مسجلة حالياً</Text>
          </View>
        }
      />

      {/* ── Modal تفاصيل الطلب والصور ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>تفاصيل الطلب #{selectedOrder?.id?.slice(0, 8)}</Text>
              <View style={{ width: 32 }} />
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                
                {/* تغيير الحالة داخل المودال */}
                <Text style={styles.sectionTitle}>حالة الطلب الحالية</Text>
                <View style={styles.statusBtns}>
                  {statuses.map((s) => {
                    const isActive = selectedOrder.status === s;
                    const btnCfg = statusConfig[s];
                    return (
                      <TouchableOpacity
                        key={s}
                        disabled={updatingId === selectedOrder.id}
                        style={[
                          styles.statusBtn,
                          isActive && { backgroundColor: btnCfg.color, borderColor: btnCfg.color },
                        ]}
                        onPress={() => updateStatus(selectedOrder.id, s)}
                      >
                        <Text style={[styles.statusBtnText, isActive && styles.statusBtnTextActive]}>
                          {btnCfg.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* قائمة المنتجات مع الصور */}
                <Text style={styles.sectionTitle}>المنتجات ({selectedOrder.items?.length || 0})</Text>
                <View style={styles.productsContainer}>
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const product = item.product || {};
                    const imageUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/100';

                    return (
                      <View key={item.id || idx} style={styles.productRow}>
                        <Image source={{ uri: imageUrl }} style={styles.productImg} />
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>{product.name || 'منتج غير معروف'}</Text>
                          <Text style={styles.productMeta}>
                            الكمية: {item.quantity} × {Number(item.price || product.price || 0).toFixed(2)} ر.س
                          </Text>
                        </View>
                        <Text style={styles.productTotal}>
                          {(Number(item.quantity) * Number(item.price || product.price || 0)).toFixed(2)} ر.س
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* معلومات التوصيل */}
                <Text style={styles.sectionTitle}>معلومات التوصيل والعميل</Text>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>اسم العميل: {selectedOrder.user?.name || 'غير محدد'}</Text>
                  <Text style={styles.infoText}>البريد: {selectedOrder.user?.email || 'غير محدد'}</Text>
                  {selectedOrder.address && (
                    <Text style={styles.infoText}>
                      العنوان: {selectedOrder.address.street}، {selectedOrder.address.city}
                    </Text>
                  )}
                </View>

                {/* الحساب النهائي */}
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>المبلغ الإجمالي:</Text>
                  <Text style={styles.summaryValue}>
                    {Number(selectedOrder.total || 0).toFixed(2)} ر.س
                  </Text>
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  /* Header */
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },

  /* List & Cards */
  listContent: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  detailsBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 2 },
  detailsBtnText: { fontSize: 12, color: '#E91E8C', fontWeight: 'bold' },

  cardBody: { marginVertical: 8, alignItems: 'flex-end' },
  customerInfo: { fontSize: 13, color: '#555', marginBottom: 2 },
  total: { fontSize: 15, fontWeight: 'bold', color: '#E91E8C' },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },
  label: { fontSize: 11, color: '#888', marginBottom: 6, textAlign: 'right' },

  /* Status Buttons */
  statusBtns: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusBtnText: { fontSize: 11, color: '#555' },
  statusBtnTextActive: { color: '#fff', fontWeight: 'bold' },

  /* Empty State */
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  empty: { textAlign: 'center', marginTop: 12, color: '#999', fontSize: 14 },

  /* Modal Styling */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  modalScroll: { paddingVertical: 12 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginTop: 12,
    marginBottom: 8,
  },

  /* Modal Product Items */
  productsContainer: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 8 },
  productRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImg: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#e0e0e0' },
  productInfo: { flex: 1, marginRight: 10, alignItems: 'flex-end' },
  productName: { fontSize: 12, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  productMeta: { fontSize: 11, color: '#777', marginTop: 2 },
  productTotal: { fontSize: 12, fontWeight: 'bold', color: '#333', marginLeft: 8 },

  infoBox: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
  infoText: { fontSize: 12, color: '#555', textAlign: 'right', marginBottom: 4 },

  summaryBox: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  summaryLabel: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#E91E8C' },
});