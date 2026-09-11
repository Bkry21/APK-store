import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCart, removeFromCart, updateCartQuantity } from '../services/cart.service';
import { useAuthStore } from '../store/auth.store';

const theme = {
  background: '#FBF8F5',
  white: '#FFFFFF',
  black: '#1A1A1A',
  grayLight: '#F2EDE4',
  grayMedium: '#E6DFD5',
  grayDark: '#8C827B',
  accentOrange: '#E26D3B',
  error: '#EF4444',
};

const CURRENCY = 'SDG';

export default function CartScreen({ navigation }: any) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const user = useAuthStore((s: any) => s.user);
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [user])
  );

  const loadCart = async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getCart(userId);
      setCart(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    const newQty = currentQty + change;
    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }

    try {
      setUpdatingId(itemId);
      await updateCartQuantity(userId, itemId, newQty);
      await loadCart();
    } catch {
      Alert.alert('خطأ', 'تعذر تحديث الكمية');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    try {
      await removeFromCart(userId, itemId);
      loadCart();
    } catch {
      Alert.alert('خطأ', 'حدثت مشكلة أثناء إزالة المنتج');
    }
  };

  const total =
    cart?.items?.reduce(
      (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
      0
    ) || 0;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        <ActivityIndicator size="large" color={theme.black} />
      </View>
    );
  }

  const bottomBarPadding = Math.max(insets.bottom, 12) + 70;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-right" size={22} color={theme.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سلة التسوق</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={cart?.items || []}
        keyExtractor={(item: any) => item.id || item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: cart?.items?.length > 0 ? bottomBarPadding + 110 : bottomBarPadding },
        ]}
        renderItem={({ item }: any) => {
          const itemId = item.id || item._id;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.itemCard}
              onPress={() => {
                if (item.product) {
                  // إرسال كائن المنتج كاملاً
                  navigation.navigate('ProductScreen', {
                    product: item.product,
                  });
                }
              }}
            >
              <View style={styles.imageContainer}>
                {item.product?.images?.length > 0 ? (
                  <Image
                    source={{ uri: item.product.images[0] }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : item.product?.image ? (
                  <Image
                    source={{ uri: item.product.image }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="image" size={24} color={theme.grayDark} />
                )}
              </View>

              <View style={styles.itemInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product?.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(itemId)}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={16} color={theme.error} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.categoryText}>
                  {typeof item.product?.category === 'object'
                    ? item.product?.category?.name
                    : item.product?.category || 'منتج فاخر'}
                </Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.itemPrice}>
                    {((item.product?.price || 0) * item.quantity).toFixed(0)} {CURRENCY}
                  </Text>

                  {/* أزرار تعديل الكمية */}
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(itemId, item.quantity, 1)}
                      disabled={updatingId === itemId}
                    >
                      <Feather name="plus" size={14} color={theme.black} />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleUpdateQuantity(itemId, item.quantity, -1)}
                      disabled={updatingId === itemId}
                    >
                      <Feather name="minus" size={14} color={theme.black} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="shopping-cart" size={40} color={theme.black} />
            </View>
            <Text style={styles.emptyTitle}>سلتك فارغة</Text>
            <Text style={styles.emptySubtitle}>لم تقم بإضافة أي منتجات إلى سلة التسوق حتى الآن.</Text>

            <TouchableOpacity
              style={styles.continueShoppingBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.continueShoppingText}>تصفح المنتجات</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cart?.items?.length > 0 && (
        <View style={[styles.footer, { bottom: bottomBarPadding - 10 }]}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>الإجمالي</Text>
            <Text style={styles.totalPrice}>{total.toFixed(0)} {CURRENCY}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutText}>إتمام الطلب</Text>
            <Feather name="arrow-left" size={18} color={theme.white} style={{ marginRight: 8 }} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.black,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: theme.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 85,
    height: 85,
    borderRadius: 16,
    backgroundColor: theme.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginLeft: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.black,
    textAlign: 'right',
    flex: 1,
  },
  categoryText: {
    fontSize: 12,
    color: theme.grayDark,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.black,
  },
  quantityContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.grayLight,
    borderRadius: 12,
    padding: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: theme.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.black,
    paddingHorizontal: 8,
  },
  removeBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.grayDark,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  continueShoppingBtn: {
    backgroundColor: theme.black,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  continueShoppingText: {
    color: theme.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: theme.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: theme.grayDark,
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.black,
  },
  checkoutBtn: {
    backgroundColor: theme.black,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  checkoutText: {
    color: theme.white,
    fontSize: 15,
    fontWeight: '700',
  },
});