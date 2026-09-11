import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform, Image, Switch, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography, shadows } from '../../theme/index';
import { getAdminBanners, createBanner, updateBanner, deleteBanner } from '../../services/banners.service';

export type BannerType = 'HERO' | 'PROMO';

interface Banner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  duration: number; // بالميلي ثانية
  order: number;
  isActive: boolean;
  type?: BannerType;
}

const EMPTY_FORM = {
  image: '',
  title: '',
  subtitle: '',
  durationMinutes: '3', // إدخال يدوي بالدقائق
  order: '0',
  type: 'HERO' as BannerType
};

export default function AdminBannersScreen({ navigation }: any) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BannerType>('HERO');
  
  const [modalVisible, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    getAdminBanners()
      .then(setBanners)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBanners(); }, []);

  const filteredBanners = banners.filter(b => (b.type || 'HERO') === activeTab);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, type: activeTab });
    setModal(true);
  };

  const openEdit = (banner: Banner) => {
    setEditTarget(banner);
    setForm({
      image: banner.image,
      title: banner.title ?? '',
      subtitle: banner.subtitle ?? '',
      durationMinutes: String(Math.max(1, Math.round((banner.duration || 180000) / 60000))),
      order: String(banner.order ?? 0),
      type: banner.type || 'HERO'
    });
    setModal(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: activeTab === 'HERO' ? [16, 6] : [16, 8],
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm((f) => ({ ...f, image: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    if (!form.image) return Alert.alert('تنبيه', 'يرجى اختيار صورة للبنر');
    
    const minutes = parseFloat(form.durationMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      return Alert.alert('تنبيه', 'يرجى إدخال مدة عرض صحيحة بالدقائق');
    }

    setSaving(true);
    try {
      const payload = {
        image: form.image,
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        duration: minutes * 60 * 1000, // تحويل الدقائق إلى ميلي ثانية
        order: Number(form.order) || 0,
        type: form.type,
      };
      
      editTarget ? await updateBanner(editTarget.id, payload) : await createBanner(payload);
      setModal(false);
      fetchBanners();
    } catch {
      Alert.alert('خطأ', 'تعذر حفظ البنر');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner: Banner) => {
    try {
      await updateBanner(banner.id, { isActive: !banner.isActive });
      fetchBanners();
    } catch {
      Alert.alert('خطأ', 'تعذر تحديث الحالة');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('حذف البنر', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await deleteBanner(id);
            fetchBanners();
          } catch {
            Alert.alert('خطأ', 'تعذر حذف البنر');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-right" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة البنرات والعروض</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs للتنقل بين بنرات الرئيسية وبنر التخفيضات */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'HERO' && styles.activeTab]} 
          onPress={() => setActiveTab('HERO')}
        >
          <Text style={[styles.tabText, activeTab === 'HERO' && styles.activeTabText]}>السلايدر الرئيسي</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'PROMO' && styles.activeTab]} 
          onPress={() => setActiveTab('PROMO')}
        >
          <Text style={[styles.tabText, activeTab === 'PROMO' && styles.activeTabText]}>بنر التخفيضات الوسطي</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBanners}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.bannerImage} />

              <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#DCFCE7' : '#FEE2E2' }]}>
                <Text style={[styles.statusText, { color: item.isActive ? '#16A34A' : '#DC2626' }]}>
                  {item.isActive ? 'فعّال' : 'معطّل'}
                </Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardInfo}>
                  {item.title ? <Text style={styles.bannerTitle}>{item.title}</Text> : null}
                  {item.subtitle ? <Text style={styles.bannerSubtitle}>{item.subtitle}</Text> : null}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>الترتيب: {item.order}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>المدة: {Math.round(item.duration / 60000)} دقيقة</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => handleToggle(item)}
                    trackColor={{ false: colors.border, true: colors.primary + '60' }}
                    thumbColor={item.isActive ? colors.primary : colors.textMuted}
                  />
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Feather name="edit-2" size={15} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Feather name="trash-2" size={15} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="image" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>لا توجد بنرات في هذا القسم</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
                <Text style={styles.emptyBtnText}>إضافة بنر جديد</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal إضافة / تعديل */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editTarget ? 'تعديل البنر' : 'إضافة بنر جديد'} ({form.type === 'HERO' ? 'سلايدر' : 'تخفيضات'})
              </Text>

              {/* اختيار صورة */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
                {form.image ? (
                  <Image source={{ uri: form.image }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Feather name="image" size={28} color={colors.textMuted} />
                    <Text style={styles.imagePlaceholderText}>اضغط لاختيار صورة البنر</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* العنوان والوصف */}
              <Text style={styles.inputLabel}>العنوان الرئيسي (اختياري)</Text>
              <TextInput
                style={styles.textInput}
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="مثال: خصم 50% على الأجهزة"
                placeholderTextColor={colors.textMuted}
                textAlign="right"
              />

              <Text style={styles.inputLabel}>العنوان الفرعي / الوصف (اختياري)</Text>
              <TextInput
                style={styles.textInput}
                value={form.subtitle}
                onChangeText={(v) => setForm((f) => ({ ...f, subtitle: v }))}
                placeholder="مثال: لفترة محدودة فقط"
                placeholderTextColor={colors.textMuted}
                textAlign="right"
              />

              {/* مدة العرض بالدقائق - إدخال يدوي */}
              <Text style={styles.inputLabel}>مدة العرض للتنقُّل (بالدقائق)</Text>
              <TextInput
                style={styles.textInput}
                value={form.durationMinutes}
                onChangeText={(v) => setForm((f) => ({ ...f, durationMinutes: v }))}
                keyboardType="numeric"
                placeholder="أدخل المدة بالدقائق (مثال: 0.5 للنصف دقيقة أو 2)"
                placeholderTextColor={colors.textMuted}
                textAlign="right"
              />

              {/* الترتيب */}
              <Text style={styles.inputLabel}>أولوية الترتيب</Text>
              <TextInput
                style={styles.textInput}
                value={form.order}
                onChangeText={(v) => setForm((f) => ({ ...f, order: v }))}
                keyboardType="numeric"
                textAlign="right"
              />

              {/* Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={styles.cancelText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveText}>{editTarget ? 'حفظ التعديلات' : 'إضافة البنر'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.md, paddingBottom: 40 },

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

  tabContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.white,
    padding: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  bannerImage: { width: '100%', height: 120, resizeMode: 'cover' },
  statusBadge: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardInfo: { flex: 1, alignItems: 'flex-end' },
  bannerTitle: { ...typography.body, fontWeight: '700', color: colors.text },
  bannerSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  metaRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    gap: spacing.xs, marginTop: spacing.xs,
  },
  metaText: { ...typography.tiny, color: colors.textMuted },
  metaDot: { ...typography.tiny, color: colors.textMuted },
  actions: { flexDirection: 'column', alignItems: 'center', gap: spacing.xs },
  editBtn: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: colors.error + '15',
    justifyContent: 'center', alignItems: 'center',
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyTitle: { ...typography.body, color: colors.textSecondary },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },

  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h3, color: colors.text, textAlign: 'right', marginBottom: spacing.lg },

  imagePicker: {
    width: '100%', height: 120,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { ...typography.small, fontWeight: '600', color: colors.textSecondary },

  inputLabel: {
    ...typography.small, fontWeight: '600',
    color: colors.textSecondary, textAlign: 'right',
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    padding: spacing.md,
    fontSize: 14, color: colors.text,
    marginBottom: spacing.md,
  },

  modalActions: { flexDirection: 'row-reverse', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  cancelText: { fontWeight: '600', color: colors.textSecondary },
  saveBtn: {
    flex: 2, padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  saveText: { fontWeight: '700', color: colors.white, fontSize: 15 },
});