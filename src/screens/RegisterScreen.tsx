import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, spacing, typography } from '../theme';
import { register } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('خطأ', 'املأ كل الحقول');
    setLoading(true);
    try {
      const data = await register(name, email, password);
      setAuth(data.user, data.token);
    } catch {
      Alert.alert('خطأ', 'حصل مشكلة في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>إنشاء حساب</Text>
          <Text style={styles.subtitle}>انضم لعالم الجمال</Text>
        </View>

        <View style={styles.form}>
          <Input label="الاسم" value={name} onChangeText={setName} placeholder="اسمك الكامل" />
          <Input label="البريد الإلكتروني" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="example@email.com" />
          <Input label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <Button title="إنشاء حساب" onPress={handleRegister} loading={loading} />

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>عندك حساب؟ <Text style={styles.linkBold}>سجّل دخول</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg },
  hero: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logo: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
  form: { backgroundColor: colors.white, borderRadius: 24, padding: spacing.lg, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  link: { marginTop: spacing.md, alignItems: 'center' },
  linkText: { color: colors.textSecondary, fontSize: 14 },
  linkBold: { color: colors.primary, fontWeight: 'bold' },
});