import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
}

export default function Button({ title, onPress, loading, variant = 'primary', disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
        : <Text style={[styles.text, variant !== 'primary' && styles.textDark]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius.lg, padding: 16, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
  ghost: { backgroundColor: colors.primaryLight },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  textDark: { color: colors.primary },
});