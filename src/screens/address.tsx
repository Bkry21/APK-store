import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth.store';
import { getUserAddresses, createAddress } from '../services/address.service';
import { colors, spacing, radius, typography, shadows } from '../theme/index';

export default function AddressScreen({ navigation }: any) {
  const user = useAuthStore((s: any) => s.user);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalVisible, setModal]  = useState(false);
  const [street, setStreet]       = useState('');
  const [city, setCity]           = useState('');
  const [saving, setSaving]       = useState(false);

  const fetchAddresses = () => {
    setLoading(true);
    getUserAddresses(user.id)
      .then(setAddresses)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleAdd = async () => {
    if (!street.trim() || !city.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الشارع والمدينة');
      return;
    }
    setSaving(true);
    try {
      await createAddress(user.id, street.trim(), city.trim());
      setStreet('');
      setCity('');
      setModal(false);
      fetchAddresses();
    } catch {
      Alert.alert('خطأ', 'تعذر إضافة العنوان، حاول مجدداً');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-right" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>عناويني</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Feather name="plus" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Feather name="map-pin" size={18} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardStreet}>{item.street}</Text>
                <Text style={styles.cardCity}>{item.city}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Feather name="map-pin" size={32} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>لا توجد عناوين</Text>
              <Text style={styles.emptySubtitle}>أضف عنوانك الأول للتوصيل</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setModal(true)}>
                <Text style={styles.emptyBtnText}>إضافة عنوان</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* FAB لو في عناوين */}
      {addresses.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
          <Feather name="plus" size={22} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Modal إضافة عنوان */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>إضافة عنوان جديد</Text>

            <Text style={styles.inputLabel}>الشارع</Text>
            <TextInput
              style={styles.textInput}
              value={street}
              onChangeText={setStreet}
              placeholder="اسم الشارع ورقم المنزل"
              placeholderTextColor={colors.textMuted}
              textAlign="right"
            />

            <Text style={styles.inputLabel}>المدينة</Text>
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="اسم المدينة"
              placeholderTextColor={colors.textMuted}
              textAlign="right"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModal(false); setStreet(''); setCity(''); }}
              >
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color={colors.white} />
                  : <Text style={styles.saveText}>حفظ العنوان</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:   { padding: spacing.md, paddingBottom: 100 },

  /* Header */
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  backBtn: { padding: spacing.xs },
  addBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Card */
  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  cardIcon: {
    width: 42, height: 42, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  cardContent: { flex: 1, alignItems: 'flex-end' },
  cardStreet: { ...typography.body, fontWeight: '600', color: colors.text },
  cardCity:   { ...typography.small, color: colors.textSecondary, marginTop: 2 },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle:    { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.small, color: colors.textSecondary, marginBottom: spacing.lg },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  /* FAB */
  fab: {
    position: 'absolute', bottom: 90, left: spacing.lg,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.lg,
  },

  /* Modal */
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h3, color: colors.text, textAlign: 'right', marginBottom: spacing.lg },
  inputLabel: {
    ...typography.small, fontWeight: '600',
    color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalActions: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: { fontWeight: '600', color: colors.textSecondary },
  saveBtn: {
    flex: 2, padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  saveText: { fontWeight: '700', color: colors.white, fontSize: 15 },
});