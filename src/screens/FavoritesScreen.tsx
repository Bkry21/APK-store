import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Image, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../store/favorites.store';
import { colors, spacing, radius, shadows } from '../theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - spacing.lg * 2 - spacing.sm) / 2;

function FavoriteCard({ item, onPress, onRemove }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.cardImgBox}>
        {item.images?.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.cardImg} resizeMode="cover" />
        ) : (
          <View style={styles.cardImgPlaceholder}>
            <Feather name="shopping-bag" size={28} color={colors.primary} />
          </View>
        )}

        {/* زر إزالة */}
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="heart" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardInfo}>
        {item.category?.name && (
          <Text style={styles.cardCategory} numberOfLines={1}>{item.category.name}</Text>
        )}
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardPrice}>{item.price} SDG</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const { favorites, favoriteIds, fetchFavorites, toggleFavorite } = useFavoritesStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerCount}>{favorites.length} منتج</Text>
        <Text style={styles.headerTitle}>المفضلة</Text>
        <Ionicons name="heart" size={22} color="#EF4444" />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>لا توجد منتجات في المفضلة</Text>
          <Text style={styles.emptySubtitle}>أضفي المنتجات التي تعجبك للمفضلة</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          >
            <Text style={styles.browseBtnText}>تصفح المنتجات</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom, 16) + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              onPress={() => navigation.navigate('Product', { product: item })}
              onRemove={() => toggleFavorite(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* Header */
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  headerCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },

  /* List */
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  /* Card */
  card: {
    width: CARD_W,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardImgBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.primaryLight,
    position: 'relative',
  },
  cardImg: { width: '100%', height: '100%' },
  cardImgPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardInfo: {
    padding: spacing.sm,
  },
  cardCategory: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 2,
  },
  cardName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
    lineHeight: 16,
    marginBottom: 6,
    height: 32,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.accent || colors.primary,
    textAlign: 'right',
  },

  /* Empty */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  browseBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});