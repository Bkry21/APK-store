import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth.store';
import api from '../services/api';
import { createOrder } from '../services/orders.service';
import { colors, spacing, radius, shadows } from '../theme';

const STEPS = ['العنوان', 'المراجعة', 'التأكيد'];

export default function CheckoutScreen({ navigation, route }: any) {
  const user = useAuthStore((s: any) => s.user);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!street.trim() || !city.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال تفاصيل العنوان كاملاً');
      return;
    }
    setStep(1);
  };

  const handleOrder = async () => {
    // 1. التحقق من وجود حساب المستخدم
    if (!user || !user.id) {
      Alert.alert('تنبيه', 'جلسة الدخول انتهت، يرجى إعادة تسجيل الدخول');
      return;
    }

    setLoading(true);
    try {
      // 2. إرسال بيانات العنوان
      const addressRes = await api.post('/addresses', {
        userId: user.id,
        street: street.trim(),
        city: city.trim(),
      });

      // 3. استخراج id العنوان بصورة آمنة
      const addressId = addressRes.data?.id || addressRes.data?.data?.id || addressRes.data?.address?.id;

      if (!addressId) {
        throw new Error('لم يتم إرجاع معرف العنوان من السيرفر');
      }

      // 4. إنشاء الطلب
      await createOrder(addressId);
      
      // الانتقال لمرحلة النجاح
      setStep(2);
    } catch (error: any) {
      console.error('Order Process Error:', error?.response?.data || error.message);
      
      const serverMessage = error?.response?.data?.message;
      let errorMessage = 'حدث مشكلة أثناء معالجة الطلب، يرجى المحاولة مرة أخرى';

      if (serverMessage === 'Cart is empty') {
        errorMessage = 'سلة التسوق الخاصة بك فارغة، يرجى إضافة منتجات أولاً قبل إتمام الطلب.';
      } else if (serverMessage) {
        errorMessage = serverMessage;
      }

      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()}
        >
          <Feather name="arrow-right" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إتمام الطلب</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Steps Indicator */}
      <View style={styles.stepsRow}>
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                i < step && styles.stepDone,
                i === step && styles.stepActive,
              ]}>
                {i < step
                  ? <Feather name="check" size={14} color={colors.white} />
                  : <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 16) + 90 }]}
      >

        {/* ── Step 0: العنوان ── */}
        {step === 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>عنوان التوصيل</Text>
              <View style={styles.sectionIcon}>
                <Feather name="map-pin" size={18} color={colors.primary} />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>اسم الشارع</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="map" size={16} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={street}
                    onChangeText={setStreet}
                    placeholder="مثال: شارع المدينة"
                    placeholderTextColor={colors.textMuted}
                    textAlign="right"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>المدينة</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="navigation" size={16} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="مثال: الخرطوم"
                    placeholderTextColor={colors.textMuted}
                    textAlign="right"
                  />
                </View>
              </View>
            </View>

            {/* نصيحة */}
            <View style={styles.tipBox}>
              <Feather name="info" size={14} color={colors.primary} />
              <Text style={styles.tipText}>تأكدي من دقة العنوان لضمان وصول طلبك</Text>
            </View>
          </View>
        )}

        {/* ── Step 1: المراجعة ── */}
        {step === 1 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مراجعة الطلب</Text>
              <View style={styles.sectionIcon}>
                <Feather name="clipboard" size={18} color={colors.primary} />
              </View>
            </View>

            {/* ملخص العنوان */}
            <View style={styles.card}>
              <View style={styles.reviewRow}>
                <TouchableOpacity onPress={() => setStep(0)}>
                  <Text style={styles.editText}>تعديل</Text>
                </TouchableOpacity>
                <View style={styles.reviewLabelRow}>
                  <Feather name="map-pin" size={15} color={colors.primary} />
                  <Text style={styles.reviewLabel}>عنوان التوصيل</Text>
                </View>
              </View>
              <Text style={styles.reviewValue}>{street}،‏ {city}</Text>
            </View>

            {/* ملخص التوصيل */}
            <View style={styles.card}>
              <View style={styles.reviewLabelRow}>
                <Feather name="truck" size={15} color={colors.primary} />
                <Text style={styles.reviewLabel}>تفاصيل التوصيل</Text>
              </View>
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryValue}>مجاني</Text>
                <Text style={styles.deliveryKey}>رسوم التوصيل</Text>
              </View>
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryValue}>3-5 أيام عمل</Text>
                <Text style={styles.deliveryKey}>وقت التوصيل المتوقع</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Step 2: تم التأكيد ── */}
        {step === 2 && (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>تم تأكيد طلبك!</Text>
            <Text style={styles.successSubtitle}>
              سيتم التواصل معك قريباً لتأكيد موعد التوصيل
            </Text>

            <View style={styles.successCard}>
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryValue}>{street}،‏ {city}</Text>
                <Text style={styles.deliveryKey}>العنوان</Text>
              </View>
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryValue}>3-5 أيام عمل</Text>
                <Text style={styles.deliveryKey}>موعد التوصيل</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.ordersBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Orders' })}
            >
              <Text style={styles.ordersBtnText}>تتبع طلباتي</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Home' })}
            >
              <Text style={styles.homeBtnText}>العودة للرئيسية</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Bottom Button */}
      {step < 2 && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
            onPress={step === 0 ? handleNext : handleOrder}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Feather
                  name={step === 0 ? 'arrow-left' : 'check-circle'}
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.ctaBtnText}>
                  {step === 0 ? 'التالي — المراجعة' : 'تأكيد الطلب'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },

  /* Steps */
  stepsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  stepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNum: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  stepNumActive: { color: colors.white },
  stepLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  stepLabelActive: { color: colors.primary },
  stepLine: {
    flex: 1, height: 2,
    backgroundColor: colors.borderLight,
    marginHorizontal: 4,
    marginBottom: 14,
  },
  stepLineDone: { backgroundColor: colors.primary },

  /* Scroll */
  scroll: { padding: spacing.lg, gap: spacing.md },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sectionIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Card */
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  /* Input */
  inputGroup: { marginBottom: spacing.md },
  label: {
    fontSize: 13, fontWeight: '700',
    color: colors.text, textAlign: 'right',
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 48,
    gap: spacing.xs,
  },
  inputIcon: { marginLeft: 4 },
  input: {
    flex: 1, fontSize: 14,
    color: colors.text,
  },

  /* Tip */
  tipBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  tipText: { fontSize: 12, color: colors.primary, fontWeight: '600', flex: 1, textAlign: 'right' },

  /* Review */
  reviewRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewLabelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  reviewValue: { fontSize: 14, color: colors.textSecondary, textAlign: 'right', marginTop: 4 },
  editText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  deliveryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  deliveryKey: { fontSize: 13, color: colors.textMuted },
  deliveryValue: { fontSize: 13, fontWeight: '700', color: colors.text },

  /* Success */
  successContainer: { alignItems: 'center', paddingTop: spacing.xl, gap: spacing.md },
  successIcon: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  successTitle: { fontSize: 22, fontWeight: '900', color: colors.text },
  successSubtitle: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  successCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  ordersBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  ordersBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  homeBtn: {
    width: '100%',
    borderRadius: radius.full,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  homeBtnText: { color: colors.text, fontSize: 14, fontWeight: '700' },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 52,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  ctaBtnDisabled: { opacity: 0.7 },
  ctaBtnText: { color: colors.white, fontSize: 15, fontWeight: '800' },
});