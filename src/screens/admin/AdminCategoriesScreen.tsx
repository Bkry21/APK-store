import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, StatusBar,
  TextInput, Image, Modal, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { colors, radius, shadows, spacing } from '../../theme';

export default function AdminCategoriesScreen({ navigation }: any) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // حالة إضافة فئة جديدة
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);

  // حالة تعديل فئة
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/categories/all');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (onDone: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) onDone(result.assets[0].uri);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return Alert.alert('تنبيه', 'يرجى إدخال اسم الفئة');
    setSubmitting(true);
    try {
      await api.post('/products/categories', {
        name: newName.trim(),
        image: newImage || undefined,
      });
      setNewName('');
      setNewImage(null);
      loadCategories();
    } catch {
      Alert.alert('خطأ', 'فشل إضافة الفئة');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setEditName(item.name);
    setEditImage(item.image || null);
    setEditModal(true);
  };

  const handleEdit = async () => {
    if (!editName.trim()) return Alert.alert('تنبيه', 'يرجى إدخال اسم الفئة');
    setSubmitting(true);
    try {
      await api.put(`/products/categories/${editItem.id}`, {
        name: editName.trim(),
        image: editImage || undefined,
      });
      setEditModal(false);
      loadCategories();
    } catch {
      Alert.alert('خطأ', 'فشل تعديل الفئة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('حذف الفئة', 'هل أنت متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/products/categories/${id}`);
            loadCategories();
          } catch {
            Alert.alert('خطأ', 'فشل الحذف - تأكد من عدم وجود منتجات مرتبطة');
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Text style={styles.pageTitle}>إدارة الفئات</Text>

      {/* ===== إضافة فئة جديدة ===== */}
      <View style={styles.addCard}>
        <Text style={styles.sectionTitle}>إضافة فئة جديدة</Text>

        {/* صورة الفئة */}
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={() => pickImage(setNewImage)}
        >
          {newImage ? (
            <Image source={{ uri: newImage }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="camera" size={22} color={colors.primary} />
              <Text style={styles.imagePlaceholderText}>إضافة صورة</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* اسم الفئة + زر الإضافة */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="اسم الفئة..."
            placeholderTextColor={colors.textMuted}
            value={newName}
            onChangeText={setNewName}
            textAlign="right"
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAdd}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Feather name="plus" size={20} color={colors.white} />
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== قائمة الفئات ===== */}
      <FlatList
        data={categories}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            {/* صورة الفئة */}
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.catImage} />
            ) : (
              <View style={styles.catImagePlaceholder}>
                <Feather name="grid" size={18} color={colors.primary} />
              </View>
            )}

            {/* الاسم */}
            <Text style={styles.catName}>{item.name}</Text>

            {/* أزرار التعديل والحذف */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEdit(item)}
              >
                <Feather name="edit-2" size={15} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Feather name="trash-2" size={15} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="grid" size={48} color={colors.border} />
            <Text style={styles.emptyText}>لا توجد فئات مضافة</Text>
          </View>
        }
      />

      {/* ===== Modal التعديل ===== */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعديل الفئة</Text>

            {/* صورة الفئة */}
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage(setEditImage)}
            >
              {editImage ? (
                <Image source={{ uri: editImage }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={22} color={colors.primary} />
                  <Text style={styles.imagePlaceholderText}>تغيير الصورة</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* اسم الفئة */}
            <TextInput
              style={[styles.input, { marginBottom: spacing.md }]}
              placeholder="اسم الفئة..."
              placeholderTextColor={colors.textMuted}
              value={editName}
              onChangeText={setEditName}
              textAlign="right"
            />

            {/* أزرار الحفظ والإلغاء */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModal(false)}
              >
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleEdit}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text style={styles.saveBtnText}>حفظ التعديلات</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'right', marginBottom: spacing.md },

  // Add Card
  addCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg, ...shadows.sm },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'right', marginBottom: spacing.sm },

  // Image Picker
  imagePicker: { alignSelf: 'center', marginBottom: spacing.md },
  imagePreview: { width: 80, height: 80, borderRadius: radius.full },
  imagePlaceholder: { width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
  imagePlaceholderText: { fontSize: 10, color: colors.primary, marginTop: 4, fontWeight: '600' },

  // Input Row
  inputRow: { flexDirection: 'row-reverse', gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.borderLight, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border },
  addBtn: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },

  // Category Card
  card: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm, gap: spacing.md },
  catImage: { width: 48, height: 48, borderRadius: radius.full },
  catImagePlaceholder: { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  catName: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  editBtn: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },

  // Empty
  empty: { alignItems: 'center', marginTop: 80, gap: spacing.md },
  emptyText: { fontSize: 14, color: colors.textMuted },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, textAlign: 'right', marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row-reverse', gap: spacing.md },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  cancelBtn: { flex: 1, backgroundColor: colors.borderLight, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: colors.text, fontWeight: '600', fontSize: 15 },
});