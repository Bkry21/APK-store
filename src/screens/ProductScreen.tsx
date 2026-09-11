import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, Image,
  TouchableOpacity, ScrollView, Dimensions,
  TextInput, ActivityIndicator
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { addToCart, removeFromCart, getCart } from '../services/cart.service';
import { useAuthStore } from '../store/auth.store';
import { colors, spacing, radius, shadows } from '../theme';
import { useFavoritesStore } from '../store/favorites.store';

const { width } = Dimensions.get('window');
const CURRENCY = 'SDG';

const INITIAL_REVIEWS = [
  {
    id: '1',
    userName: 'سارة أحمد',
    rating: 5,
    date: 'منذ يومين',
    comment: 'المنتج ممتاز جداً ونتيجته ظهرت من أول استخدام، والتوصيل كان سريع!',
  },
  {
    id: '2',
    userName: 'مريم محمد',
    rating: 4,
    date: 'منذ أسبوع',
    comment: 'جودة العبوة ممتازة والمنتج أصلي 100%، أنصح به.',
  },
];


export default function ProductScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { product } = route.params || {};
  const user = useAuthStore((s: any) => s.user);
  const productId = product?.id || product?._id; // ← مرة وحدة بس هنا

  const { favoriteIds, toggleFavorite, fetchFavorites } = useFavoritesStore();
  const fav = favoriteIds.has(productId); // ← هنا بعدها مباشرةً

  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    checkCartStatus();
  }, [user, product]);
  const checkCartStatus = async () => {
    const userId = user?.id || user?._id;
    const pId = product?.id || product?._id;
    if (!userId || !pId) return;

    try {
      const cartData = await getCart(userId);
      const items = cartData?.items || cartData || [];
      const existingItem = items.find((item: any) => 
        (item.productId === pId) || (item.product?.id === pId) || (item.product?._id === pId)
      );

      if (existingItem) {
        setIsInCart(true);
        setCartItemId(existingItem.id || existingItem._id);
      } else {
        setIsInCart(false);
        setCartItemId(null);
      }
    } catch (error) {
      console.log('Error checking cart status:', error);
    }
  };

  if (!product) {
    return (
      <View style={styles.emptyRoot}>
        <Text style={styles.emptyText}>لم يتم العثور على بيانات المنتج</Text>
      </View>
    );
  }

 

  const navigateToCart = () => {
   navigation.navigate('Main', { screen: 'Cart' });
  };

  const handleAddToCart = async () => {
    if (!user) return navigation.navigate('Login');

    if (isInCart) {
      return navigateToCart();
    }

    setLoading(true);
    try {
      const userId = user.id || user._id;
      const res = await addToCart(userId, productId, quantity);
      setIsInCart(true);
      if (res?.id || res?._id) setCartItemId(res.id || res._id);
      await checkCartStatus();
    } catch {
      Alert.alert('خطأ', 'حدثت مشكلة أثناء الإضافة للسلة، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    const userId = user?.id || user?._id;
    if (!userId || !cartItemId) return;

    setLoading(true);
    try {
      await removeFromCart(userId, cartItemId);
      setIsInCart(false);
      setCartItemId(null);
    } catch {
      Alert.alert('خطأ', 'حدثت مشكلة أثناء حذف المنتج من السلة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = () => {
    if (!newComment.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة تعليقك أولاً');
      return;
    }
    const reviewObj = {
      id: Date.now().toString(),
      userName: user?.name || 'زائر',
      rating: newRating,
      date: 'الآن',
      comment: newComment.trim(),
    };
    setReviews([reviewObj, ...reviews]);
    setNewComment('');
    setShowAddReview(false);
    Alert.alert('شكراً لك!', 'تمت إضافة تقييمك بنجاح.');
  };

  const isOutOfStock = product.stock === 0;
  const images = product.images?.length > 0 ? product.images : [product.image].filter(Boolean);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const categoryName = typeof product.category === 'object'
    ? product.category?.name
    : product.category;

  return (
    <View style={styles.root}>
      {/* ===== 1. FIXED TOP HEADER ===== */}
      <View style={[styles.fixedHeader, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-right" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>تفاصيل المنتج</Text>

        <TouchableOpacity 
  style={styles.headerBtn} 
  onPress={() => user ? toggleFavorite(productId) : navigation.navigate('Login')}
>
  <Ionicons
    name={fav ? 'heart' : 'heart-outline'}
    size={20}
    color={fav ? colors.error : colors.text}
  />
</TouchableOpacity>
      </View>

      {/* ===== MAIN SCROLLABLE CONTENT ===== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 100 }}
      >
        {/* ===== 2. IMAGE AREA ===== */}
        <View style={styles.imageContainer}>
          {images[activeImage] ? (
            <Image
              source={{ uri: images[activeImage] }}
              style={styles.fullWidthImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={64} color={colors.textMuted} />
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_: any, i: number) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <View style={[styles.dot, activeImage === i && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.thumbnailStrip}>
              {images.map((img: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.thumbnail, activeImage === i && styles.thumbnailActive]}
                  onPress={() => setActiveImage(i)}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ===== 3. DETAILS CARD ===== */}
        <View style={styles.detailsCard}>
          {!!categoryName && (
            <Text style={styles.category}>{categoryName.toString().toUpperCase()}</Text>
          )}

          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.ratingStockRow}>
            <View style={[styles.stockPill, isOutOfStock && styles.stockPillOut]}>
              <View style={[styles.stockDot, isOutOfStock && styles.stockDotOut]} />
              <Text style={[styles.stockText, isOutOfStock && styles.stockTextOut]}>
                {isOutOfStock ? 'نفد المخزون' : 'متوفر'}
              </Text>
            </View>

            <View style={styles.ratingBox}>
              <Text style={styles.reviewsCount}>({reviews.length})</Text>
              <Text style={styles.ratingText}>{averageRating}</Text>
              <Ionicons name="star" size={14} color={colors.accent} />
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>السعر</Text>
            <Text style={styles.price}>{product.price} {CURRENCY}</Text>
          </View>

          <View style={styles.divider} />

          {!!product.description && (
            <>
              <Text style={styles.sectionTitle}>تفاصيل المنتج</Text>
              <Text style={styles.description}>{product.description}</Text>
              <View style={styles.divider} />
            </>
          )}

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>الكمية</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Feather name="minus" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qBtn}
                onPress={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                disabled={isOutOfStock}
              >
                <Feather name="plus" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ===== REVIEWS & COMMENTS SECTION ===== */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <TouchableOpacity
                style={styles.addReviewBtn}
                onPress={() => setShowAddReview(!showAddReview)}
              >
                <Feather name={showAddReview ? 'x' : 'edit-3'} size={14} color={colors.primary} />
                <Text style={styles.addReviewBtnText}>
                  {showAddReview ? 'إلغاء' : 'أضف تقييمك'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>آراء العملاء ({reviews.length})</Text>
            </View>

            {showAddReview && (
              <View style={styles.addReviewCard}>
                <Text style={styles.addReviewTitle}>تقييمك للمنتج:</Text>
                <View style={styles.starsPickerRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                      <Ionicons
                        name={star <= newRating ? 'star' : 'star-outline'}
                        size={24}
                        color={colors.accent}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="اكتب تعليقك وتجربتك هنا..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={newComment}
                  onChangeText={setNewComment}
                  textAlign="right"
                />
                <TouchableOpacity style={styles.submitReviewBtn} onPress={handleAddReview}>
                  <Text style={styles.submitReviewText}>إرسال التقييم</Text>
                </TouchableOpacity>
              </View>
            )}

            {reviews.map((item) => (
              <View key={item.id} style={styles.reviewItem}>
                <View style={styles.reviewItemHeader}>
                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < item.rating ? 'star' : 'star-outline'}
                        size={12}
                        color={colors.accent}
                      />
                    ))}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.reviewDate}>{item.date}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ===== BOTTOM BAR ===== */}
      <View style={[
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom, 12) + 4 }
      ]}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>الإجمالي</Text>
          <Text style={styles.totalPrice}>{((product.price || 0) * quantity).toFixed(0)} {CURRENCY}</Text>
        </View>

        <View style={styles.actionsContainer}>
          {isInCart && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={handleRemoveFromCart}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Feather name="trash-2" size={18} color={colors.white} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.addBtn,
              isInCart && styles.addBtnInCart,
              (isOutOfStock || loading) && styles.addBtnDisabled
            ]}
            onPress={handleAddToCart}
            disabled={isOutOfStock || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Feather 
                  name={isInCart ? "check-circle" : "shopping-cart"} 
                  size={18} 
                  color={colors.white} 
                />
                <Text style={styles.addBtnText}>
                  {isOutOfStock 
                    ? 'نفد المخزون' 
                    : isInCart 
                    ? 'عرض في السلة' 
                    : 'أضف للسلة'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background || '#F8FAFC' },
  emptyRoot: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyText: { fontSize: 15, color: colors.textMuted },
  
  /* ===== FIXED HEADER STYLES ===== */
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // يمكنك استبدالها بـ justifyContent لتفادي أي تحذيرات
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 20,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ===== IMAGE STYLES ===== */
  imageContainer: {
    width: width,
    height: width * 0.85,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  fullWidthImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.3)' },
  dotActive: { width: 18, backgroundColor: colors.primary },
  thumbnailStrip: {
    position: 'absolute',
    left: spacing.md,
    bottom: 12,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  thumbnailActive: { borderColor: colors.primary },
  thumbnailImg: { width: '100%', height: '100%' },

  /* ===== DETAILS CARD STYLES ===== */
  detailsCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 0,
    ...shadows.sm,
  },
  category: {
    fontSize: 11, color: colors.primary,
    fontWeight: '800', letterSpacing: 1.2,
    textAlign: 'right', marginBottom: 4,
  },
  name: {
    fontSize: 20, fontWeight: '800',
    color: colors.text, textAlign: 'right',
    lineHeight: 28, marginBottom: spacing.sm,
  },
  ratingStockRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stockPill: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full,
  },
  stockPillOut: { backgroundColor: '#FEE2E2' },
  stockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  stockDotOut: { backgroundColor: colors.error },
  stockText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  stockTextOut: { color: colors.error },
  ratingBox: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: 'bold', color: colors.text },
  reviewsCount: { fontSize: 12, color: colors.textSecondary },
  priceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  price: { fontSize: 24, fontWeight: '900', color: colors.accent },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: colors.text,
    textAlign: 'right', marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13, color: colors.textSecondary,
    lineHeight: 22, textAlign: 'right',
  },
  quantityRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  quantityControls: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: radius.md, padding: 3, gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  qBtn: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.sm,
  },
  quantityText: {
    fontSize: 15, fontWeight: 'bold',
    color: colors.text, width: 32, textAlign: 'center',
  },
  reviewsSection: { marginTop: spacing.xs },
  reviewsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addReviewBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full,
  },
  addReviewBtnText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
  addReviewCard: {
    backgroundColor: colors.borderLight,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  addReviewTitle: { fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'right' },
  starsPickerRow: { flexDirection: 'row-reverse', gap: 8, marginVertical: 4 },
  reviewInput: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 12, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
    minHeight: 60,
  },
  submitReviewBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitReviewText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  reviewItem: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewItemHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: { alignItems: 'flex-end' },
  userName: { fontSize: 12, fontWeight: '700', color: colors.text },
  reviewDate: { fontSize: 10, color: colors.textMuted },
  starsRow: { flexDirection: 'row-reverse', gap: 2 },
  reviewComment: { fontSize: 12, color: colors.textSecondary, textAlign: 'right', marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
    gap: spacing.md,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
  totalSection: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  totalPrice: { fontSize: 18, fontWeight: '900', color: colors.accent },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    gap: spacing.xs,
    alignItems: 'center',
  },
  addBtn: {
    flex: 1, 
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    height: 48, 
    borderRadius: radius.full,
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: spacing.xs,
    ...shadows.md,
  },
  addBtnInCart: { backgroundColor: '#10B981' },
  removeBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.error || '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  addBtnDisabled: { backgroundColor: colors.textMuted },
  addBtnText: { color: colors.white, fontSize: 14, fontWeight: 'bold' },
});