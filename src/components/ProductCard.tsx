import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';

const { width } = Dimensions.get('window');
// حساب العرض الدقيق لكل كارت ليكون المظهر ممتاز في الشبكة (Grid)
const cardWidth = (width - spacing.lg * 2 - spacing.sm) / 2;

interface Props {
  product: any;
  onPress: () => void;
  onAddToCart?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export default function ProductCard({ product, onPress, onAddToCart, onFavorite, isFavorite }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>

      {/* ===== صورة المنتج ===== */}
      <View style={styles.imageContainer}>
        {product.images?.length > 0 ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="shopping-bag" size={28} color={colors.primary} />
          </View>
        )}

        {/* زر المفضلة */}
        <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={14}
            color={isFavorite ? colors.error : colors.text}
          />
        </TouchableOpacity>

        {/* Badge: جديد أو الأكثر مبيعاً */}
        {product.isTop ? (
          <View style={[styles.badge, styles.badgeTop]}>
            <Text style={styles.badgeText}>🔥 الأكثر مبيعاً</Text>
          </View>
        ) : product.isNew ? (
          <View style={[styles.badge, styles.badgeNew]}>
            <Text style={styles.badgeText}>✨ جديد</Text>
          </View>
        ) : null}

        {/* Badge: آخر قطع */}
        {product.stock < 10 && product.stock > 0 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>آخر {product.stock}</Text>
          </View>
        )}

        {/* Badge: نفذ المخزون */}
        {product.stock === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>نفذ المخزون</Text>
          </View>
        )}
      </View>

      {/* ===== معلومات المنتج ===== */}
      <View style={styles.info}>
        {product.category?.name && (
          <Text style={styles.category} numberOfLines={1}>{product.category.name}</Text>
        )}
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* تقييم المنتج */}
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons key={i} name={i <= 4 ? 'star' : 'star-outline'} size={10} color={colors.accent} />
          ))}
          <Text style={styles.reviewsCount}>(0)</Text>
        </View>

        {/* السعر وزر الإضافة */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.addBtn, product.stock === 0 && styles.addBtnDisabled]}
            onPress={product.stock > 0 ? onAddToCart : undefined}
            activeOpacity={product.stock > 0 ? 0.8 : 1}
          >
            <Feather name="plus" size={14} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.price}>{product.price} SDG</Text>
        </View>
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth, // 👈 تم التعديل إلى العرض الحسابي المباشر للشبكة
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // 👈 التناسب المربع للصورة يعطي مظهراً أكثر ترتيباً
    position: 'relative',
    backgroundColor: colors.primaryLight,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeNew: { backgroundColor: colors.primary },
  badgeTop: { backgroundColor: '#E8A838' },
  badgeText: { fontSize: 8, fontWeight: '800', color: colors.white },
  stockBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: colors.error,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stockBadgeText: { fontSize: 9, color: colors.white, fontWeight: '700' },
outOfStockOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  justifyContent: 'center',
  alignItems: 'center',
},
  outOfStockText: { color: colors.white, fontWeight: '800', fontSize: 12 },
  info: { padding: spacing.xs + 2 },
  category: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    lineHeight: 16,
    height: 32, // ارتفاع ثابت لسطرين حتى تتوحد أطوال الكروت بالكامل
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  reviewsCount: { fontSize: 9, color: colors.textMuted, marginRight: 2 },
  footerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 6,
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: colors.border },
  price: { fontSize: 12, fontWeight: '900', color: colors.primary },
});