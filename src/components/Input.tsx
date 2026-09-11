import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { colors, radius } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export default function Input({ label, error, rightElement, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputWrapper,
        focused && styles.inputWrapperFocused,
        error  && styles.inputWrapperError,
      ]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightElement && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'right',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },

  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },

  rightElement: {
    paddingLeft: 8,
  },

  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    textAlign: 'right',
  },
});