import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { colors, spacing, radius, shadows, typography } from '../../theme';

export default function AdminProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', images: [] as string[],
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item: any) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      stock: String(item.stock),
      images: item.images || [],
    });
    setEditModal(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) {
      setForm(f => ({ ...f, images: [...f.images, result.assets[0].uri] }));
    }
  };

  const removeImage = (index: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      return Alert.alert('تنبيه', 'يرجى تعبئة الحقول الأساسية');
    }
    setSaving(true);
    try {
      await api.put(`/products/${editTarget.id}`, {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        images: form.images,
      });
      setEditModal(false);
      loadProducts();
    } catch {
      Alert.alert('خطأ', 'فشل تعديل المنتج');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('حذف المنتج', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/products/${id}`);
            loadProducts();
          } catch {
            Alert.alert('خطأ', 'فشل الحذف');
          }
        },
      },
    ]);
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminAddProduct', { onDone: loadProducts })}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color={colors.white} />
          <Text style={styles.addBtnText}>إضافة منتج جديد</Text>
        </TouchableOpacity>

        <FlatList
          data={products}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }: any) => (
            <View style={styles.card}>
              {/* صورة */}
              <View style={styles.cardImage}>
                {item.images?.length > 0 ? (
                  <Image source={{ uri: item.images[0] }} style={styles.productImg} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Feather name="image" size={20} color={colors.textMuted} />
                  </View>
                )}
              </View>

              {/* معلومات */}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.category}>{item.category?.name}</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.price}>{item.price} SDG</Text>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.stock}>مخزون: {item.stock}</Text>
                </View>
              </View>

              {/* أزرار */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Feather name="edit-2" size={15} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Feather name="trash-2" size={15} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="box" size={48} color={colors.border} />
              <Text style={styles.emptyText}>لا توجد منتجات</Text>
            </View>
          }
        />
      </View>

      {/* Modal التعديل */}
      <Modal visible={editModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>

              <Text style={styles.modalTitle}>تعديل المنتج</Text>

              {/* صور */}
              <Text style={styles.inputLabel}>صور المنتج</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                {form.images.map((uri, i) => (
                  <View key={i} style={styles.imgWrapper}>
                    <Image source={{ uri }} style={styles.imgPreview} resizeMode="cover" />
                    <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(i)}>
                      <Feather name="x" size={12} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
                  <Feather name="plus" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </ScrollView>

              <Text style={styles.inputLabel}>اسم المنتج</Text>
              <TextInput
                style={styles.textInput}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                textAlign="right"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>الوصف</Text>
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                textAlign="right"
                multiline
                textAlignVertical="top"
                placeholderTextColor={colors.textMuted}
              />

              <View style={{ flexDirection: 'row-reverse', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>السعر</Text>
                  <TextInput
                    style={styles.textInput}
                    value={form.price}
                    onChangeText={v => setForm(f => ({ ...f, price: v }))}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>المخزون</Text>
                  <TextInput
                    style={styles.textInput}
                    value={form.stock}
                    onChangeText={v => setForm(f => ({ ...f, stock: v }))}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                  <Text style={styles.cancelText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color={colors.white} />
                    : <Text style={styles.saveText}>حفظ التعديلات</Text>
                  }
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
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },

  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: { width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden' },
  productImg: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, alignItems: 'flex-end' },
  name: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  category: { fontSize: 11, color: colors.primary, fontWeight: '600', marginBottom: 4 },
  detailsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  price: { fontSize: 13, fontWeight: '700', color: colors.accent },
  dot: { color: colors.textMuted, fontSize: 12 },
  stock: { fontSize: 12, color: colors.textSecondary },
  actions: { flexDirection: 'column', gap: spacing.xs },
  editBtn: {
    width: 34, height: 34, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: {
    width: 34, height: 34, borderRadius: radius.md,
    backgroundColor: colors.error + '15',
    justifyContent: 'center', alignItems: 'center',
  },

  empty: { alignItems: 'center', marginTop: 80, gap: spacing.md },
  emptyText: { fontSize: 14, color: colors.textMuted },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.h3, color: colors.text, textAlign: 'right', marginBottom: spacing.lg },
  inputLabel: {
    fontSize: 13, fontWeight: '600',
    color: colors.textSecondary, textAlign: 'right',
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15, color: colors.text,
    marginBottom: spacing.md,
  },

  // Image picker
  imgWrapper: { width: 64, height: 80, borderRadius: radius.md, marginRight: spacing.sm, position: 'relative' },
  imgPreview: { width: '100%', height: '100%', borderRadius: radius.md },
  removeImg: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  addImgBtn: {
    width: 64, height: 80, borderRadius: radius.md,
    backgroundColor: colors.borderLight,
    borderWidth: 1.5, borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
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