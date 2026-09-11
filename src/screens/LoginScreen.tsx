import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Alert, SafeAreaView, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import { login } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { colors, spacing, radius, typography, shadows } from '../theme/index';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const setAuth = useAuthStore((s: any) => s.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      const response: any = await login(email.trim().toLowerCase(), password);
      const userData  = response.user  || response.data?.user;
      const tokenData = response.token || response.data?.token;
      if (userData && tokenData) {
        setAuth(userData, tokenData);
        navigation.goBack();
      } else {
        Alert.alert('خطأ', 'بيانات غير صالحة من الخادم');
      }
    } catch (error: any) {
      Alert.alert(
        'خطأ في تسجيل الدخول',
        error.response?.data?.message || 'تأكد من البريد الإلكتروني وكلمة المرور',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Feather name="shopping-cart" size={28} color={colors.white} />
              </View>
            </View>
            <Text style={styles.title}>مرحباً بك مجدداً</Text>
            <Text style={styles.subtitle}>سجّل دخولك للمتابعة إلى المتجر</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Input
              label="البريد الإلكتروني"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="example@email.com"
            />

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="كلمة المرور"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                rightElement={
                  <TouchableOpacity onPress={() => setShowPass(!showPassword)} style={styles.eyeBtn}>
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {/* نسيت كلمة المرور */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => Alert.alert('قريباً', 'هذه الميزة ستكون متاحة قريباً')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

            <View style={{ marginTop: spacing.lg }}>
              <Button title="تسجيل الدخول" onPress={handleLogin} loading={loading} />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>أو</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerText}>
                ليس لديك حساب؟{' '}
                <Text style={styles.registerBold}>إنشاء حساب جديد</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accentBar} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  logoOuter: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoInner: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.md,
  },
  title:    { ...typography.h2, color: colors.text, marginBottom: 6, textAlign: 'center' },
  subtitle: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },

  eyeBtn: { padding: 4 },

  forgotBtn: { alignSelf: 'flex-start', marginTop: spacing.sm },
  forgotText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: spacing.lg, gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
  dividerText: { ...typography.small, color: colors.textMuted },

  registerBtn:  { alignItems: 'center' },
  registerText: { ...typography.small, color: colors.textSecondary },
  registerBold: { color: colors.primary, fontWeight: '700' },

  accentBar: {
    height: 3, backgroundColor: colors.primary,
    borderRadius: radius.full,
    marginTop: spacing.xl, marginHorizontal: spacing.xxl,
    opacity: 0.35,
  },
});