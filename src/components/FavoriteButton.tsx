import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ← غيّرنا لـ Ionicons زي ProductCard
import { useFavoritesStore } from '../store/favorites.store';
import { useAuthStore } from '../store/auth.store';

interface Props {
  productId: string;
  size?: number;
  style?: any;
}

export default function FavoriteButton({ productId, size = 14, style }: Props) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { token } = useAuthStore();
  const fav = isFavorite(productId);

  if (!token) return null;

  return (
    <TouchableOpacity
      onPress={() => toggleFavorite(productId)}
      style={[styles.btn, style]}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name={fav ? 'heart' : 'heart-outline'}
        size={size}
        color={fav ? '#EF4444' : '#1A1A1A'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});