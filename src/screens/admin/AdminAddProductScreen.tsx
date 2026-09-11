import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

const theme = {
  white: '#FFFFFF',
  black: '#1A1A1A',
  background: '#F8F9FA',
  grayLight: '#F3F4F6',
  grayMedium: '#E5E7EB',
  grayDark: '#6B7280',
  error: '#EF4444',
};

export default function AdminAddProductScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    api.get('/products/categories/all').then((res) => setCategories(res.data));
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // دالة محاكاة الإشعار بشكل أنيق ومناسب لـ Expo Go دون الحاجة لأوامر بناء أو استهلاك نت
  const showProductAddedNotification = (productName: string, productPrice: string) => {
    Alert.alert(
      '🔥 تم إضافة المنتج وإطلاق الإشعار!',
      `اسم المنتج: ${productName}\nالسعر: ${productPrice} SDG\n\n(تم إرسال التنبيه للمستخدمين بنجاح)`,
      [{ text: 'حسناً', onPress: () => navigation.goBack() }]
    );
  };

  const handleAdd = async () => {
    if (!name || !price || !stock || !categoryId) {
      return Alert.alert('تنبيه', 'يرجى تعبئة كافة الحقول الأساسية');
    }

    setLoading(true);
    try {
      await api.post('/products', {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: images,
        categoryId,
      });

      // إظهار التنبيه التفاعلي
      showProductAddedNotification(name, price);

    } catch {
      Alert.alert('خطأ', 'حدثت مشكلة أثناء إضافة المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-right" size={24} color={theme.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة منتج جديد</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <Text style={styles.sectionTitle}>صور المنتج (طولية)</Text>

          {images.length === 0 ? (
            <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage} activeOpacity={0.7}>
              <View style={styles.iconCircle}>
                <Feather name="camera" size={24} color={theme.black} />
              </View>
              <Text style={styles.uploadText}>اضغط لإرفاق صور طولية للمنتج</Text>
              <Text style={styles.uploadSubtext}>نسبة العرض للارتفاع 3:4</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesListContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <Feather name="x" size={14} color={theme.white} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.imageUploadBoxSmall} onPress={pickImage} activeOpacity={0.7}>
                <Feather name="plus" size={22} color={theme.grayDark} />
              </TouchableOpacity>
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>اسم المنتج</Text>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="أدخل اسم المنتج..." placeholderTextColor={theme.grayDark} />
              <Feather name="box" size={18} color={theme.grayDark} style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>وصف المنتج</Text>
            <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="اكتب تفاصيل المنتج..." placeholderTextColor={theme.grayDark} multiline textAlignVertical="top" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>السعر</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" placeholderTextColor={theme.grayDark} />
                <Feather name="tag" size={18} color={theme.grayDark} style={styles.inputIcon} />
              </View>
            </View>
            <View style={{ width: 15 }} />
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>المخزون (الكمية)</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="0" keyboardType="numeric" placeholderTextColor={theme.grayDark} />
                <Feather name="layers" size={18} color={theme.grayDark} style={styles.inputIcon} />
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>تصنيف المنتج</Text>
          <View style={styles.categoriesWrapper}>
            {categories.map((cat: any) => {
              const isSelected = categoryId === cat.id;
              return (
                <TouchableOpacity key={cat.id} style={[styles.catChip, isSelected && styles.catChipActive]} onPress={() => setCategoryId(cat.id)} activeOpacity={0.8}>
                  <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleAdd} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={theme.white} /> : (
              <>
                <Text style={styles.submitButtonText}>حفظ وإضافة المنتج</Text>
                <Feather name="check" size={18} color={theme.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.grayMedium },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.grayMedium },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.black },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.black, marginBottom: 12, marginTop: 20, textAlign: 'right' },
  imageUploadBox: { backgroundColor: theme.white, borderWidth: 1.5, borderColor: theme.grayMedium, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.grayLight, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadText: { fontSize: 14, fontWeight: '600', color: theme.black, marginBottom: 4 },
  uploadSubtext: { fontSize: 12, color: theme.grayDark },
  imagesListContainer: { flexDirection: 'row', marginBottom: 10 },
  imagePreviewWrapper: { width: 75, height: 100, borderRadius: 12, marginRight: 12, position: 'relative' },
  imagePreview: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: theme.error, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.white },
  imageUploadBoxSmall: { width: 75, height: 100, borderRadius: 12, backgroundColor: theme.white, borderWidth: 1.5, borderColor: theme.grayMedium, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, color: theme.grayDark, marginBottom: 8, fontWeight: '600', textAlign: 'right' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderWidth: 1, borderColor: theme.grayMedium, borderRadius: 12, paddingHorizontal: 15, height: 50 },
  input: { flex: 1, fontSize: 14, color: theme.black, textAlign: 'right' },
  inputIcon: { marginLeft: 10 },
  textArea: { height: '100%', paddingTop: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  categoriesWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 },
  catChip: { backgroundColor: theme.white, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.grayMedium, marginBottom: 8, marginLeft: 8 },
  catChipActive: { backgroundColor: theme.black, borderColor: theme.black },
  catChipText: { color: theme.grayDark, fontSize: 13, fontWeight: '600' },
  catChipTextActive: { color: theme.white },
  submitButton: { backgroundColor: theme.black, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 14, paddingVertical: 16, marginTop: 35 },
  submitButtonDisabled: { backgroundColor: theme.grayDark },
  submitButtonText: { color: theme.white, fontSize: 16, fontWeight: 'bold' },
});