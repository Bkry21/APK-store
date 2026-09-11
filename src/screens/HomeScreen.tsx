import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, StatusBar, Image, Dimensions,
  ScrollView, TextInput,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavoritesStore } from '../store/favorites.store';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getProducts, getCategories, getBanners, getTrending } from '../services/products.service';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuthStore } from '../store/auth.store';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');
const BANNER_W = width - spacing.lg * 2;

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [products, setProducts]                 = useState<any[]>([]);
  const [categories, setCategories]             = useState<any[]>([]);
  const [banners, setBanners]                   = useState<any[]>([]);
  const [trending, setTrending]                 = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [search, setSearch]                     = useState('');
  const [activeBanner, setActiveBanner]         = useState(0);

  const user      = useAuthStore((s: any) => s.user);
  const bannerRef = useRef<FlatList>(null);
  const { favoriteIds, toggleFavorite, fetchFavorites } = useFavoritesStore();

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadProducts(); }, [selectedCategory]);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  // التمرير التلقائي للبنر العلوي
  useEffect(() => {
    if (banners.length <= 1) return;
    const iv = setInterval(() => {
      const next = (activeBanner + 1) % banners.length;
      setActiveBanner(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 4000);
    return () => clearInterval(iv);
  }, [activeBanner, banners.length]);

  const loadData = async () => {
    try {
      const [prods, cats, bans, trend] = await Promise.all([
        getProducts(), getCategories(), getBanners(), getTrending(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBanners(bans);
      setTrending(trend);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const prods = await getProducts(selectedCategory || undefined);
    setProducts(prods);
  };

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // تقسيم المنتجات إلى عمودين لتطبيق نمط Masonry (التخالف في الارتفاع)
  const rightColumnProducts = filtered.filter((_, index) => index % 2 === 0);
  const leftColumnProducts  = filtered.filter((_, index) => index % 2 !== 0);

  // كارت المنتج الأفقي (لشبكة "وصل حديثاً" و"الأكثر مبيعاً")
  const renderHorizontalProductCard = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.cardHorizontal}
      onPress={() => navigation.navigate('Product', { product: item })}
      activeOpacity={0.88}
    >
      <View style={styles.cardImgBox}>
        {item.images?.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.cardImg} resizeMode="cover" />
        ) : (
          <View style={styles.cardPlaceholder}>
            <Feather name="shopping-bag" size={16} color={colors.primary} />
          </View>
        )}
        <TouchableOpacity 
          style={styles.cardFavBtn}
          onPress={() => user ? toggleFavorite(item.id) : navigation.navigate('Login')}
        >
          <Ionicons 
            name={favoriteIds.has(item.id) ? 'heart' : 'heart-outline'} 
            size={12} 
            color={favoriteIds.has(item.id) ? colors.error : colors.text} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardPrice}>{item.price} SDG</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ══════════════════════════════
          HEADER
      ══════════════════════════════ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Feather name="menu" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerHello}>
            {user ? `مرحباً، ${user.name?.split(' ')[0]} ✨` : 'مرحباً بك ✨'}
          </Text>
          <Text style={styles.headerTitle}>اكتشفي الجمال</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Feather name="bell" size={19} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Feather name="shopping-cart" size={19} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 90
        }}
        stickyHeaderIndices={[2]} // تثبيت شريط البحث أثناء التمرير
      >

        {/* 0. BANNER CAROUSEL العلوي */}
        {banners.length > 0 ? (
          <View style={styles.bannerSection}>
            <FlatList
              ref={bannerRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item: any) => item.id}
              getItemLayout={(_, i) => ({ length: BANNER_W + spacing.md, offset: (BANNER_W + spacing.md) * i, index: i })}
              onMomentumScrollEnd={(e) => {
                setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + spacing.md)));
              }}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
              renderItem={({ item }: any) => (
                <View style={styles.bannerCard}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.bannerImg} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={[colors.primaryLight, colors.primary]} style={styles.bannerImg} />
                  )}
                  {(item.title || item.subtitle) && (
                    <View style={styles.bannerOverlay}>
                      {item.subtitle && <Text style={styles.bannerTag}>{item.subtitle}</Text>}
                      {item.title    && <Text style={styles.bannerTitle}>{item.title}</Text>}
                      <TouchableOpacity style={styles.bannerBtn}>
                        <Text style={styles.bannerBtnText}>تسوقي الآن</Text>
                        <Feather name="arrow-left" size={13} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            />
            {banners.length > 1 && (
              <View style={styles.dotsRow}>
                {banners.map((_: any, i: number) => (
                  <View key={i} style={[styles.dot, i === activeBanner && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.bannerPlaceholder}>
            <Text style={styles.bannerPlaceholderText}>لا توجد عروض حالياً</Text>
          </View>
        )}

        {/* 1. CATEGORIES — التصنيفات */}
        <View style={styles.section}>
          <FlatList
            data={[{ id: null, name: 'الكل', image: null }, ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item: any) => item.id || 'all'}
            contentContainerStyle={styles.catList}
            renderItem={({ item }: any) => {
              const active = selectedCategory === item.id;
              return (
                <TouchableOpacity
                  style={styles.catItem}
                  onPress={() => setSelectedCategory(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.catCircle, active && styles.catCircleActive]}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.catCircleImg} />
                    ) : (
                      <Feather name="grid" size={20} color={active ? colors.white : colors.primary} />
                    )}
                  </View>
                  <Text style={[styles.catName, active && styles.catNameActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* 2. SEARCH + FILTER — مثبت أثناء التمرير */}
        <View style={styles.stickySearchContainer}>
          <View style={styles.searchRow}>
            <TouchableOpacity style={styles.filterBtn}>
              <Feather name="sliders" size={18} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="ابحثي عن منتج..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={colors.textMuted}
                textAlign="right"
              />
              <Feather name="search" size={17} color={colors.textMuted} />
            </View>
          </View>
        </View>

        {/* 3. وصل حديثاً (أفقي مع سكرول سلس) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
              <Feather name="arrow-left" size={13} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>وصل حديثاً</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContainer}
          >
            {filtered.slice(0, 10).map((item: any) => renderHorizontalProductCard(item))}
          </ScrollView>
        </View>

        {/* 4. المنتجات الأكثر مبيعاً (أفقي مع سكرول سلس) */}
        {trending.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>عرض الكل</Text>
                <Feather name="arrow-left" size={13} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>الأكثر مبيعاً</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
            >
              {trending.slice(0, 10).map((item: any) => renderHorizontalProductCard(item))}
            </ScrollView>
          </View>
        )}

        {/* 5. بنر التخفيضات الأوسط */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          {banners.length > 0 ? (
            <View style={styles.midBannerCard}>
              <Image 
                source={{ uri: banners[0]?.image || 'https://via.placeholder.com/600x200' }} 
                style={styles.midBannerImg} 
                resizeMode="cover" 
              />
              <View style={styles.midBannerOverlay}>
                <Text style={styles.midBannerTag}>تخفيضات مميزة</Text>
                <Text style={styles.midBannerTitle}>{banners[0]?.title || 'عروض خاصة لهذا الأسبوع'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.midBannerPlaceholder}>
              <Feather name="tag" size={22} color={colors.primary} />
              <Text style={styles.midBannerPlaceholderText}>لا يوجد عرض تخفيض حالياً</Text>
            </View>
          )}
        </View>

        {/* 6. جميع المنتجات (تخطيط العمودين المتداخلين - Masonry Grid) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.productsCount}>{filtered.length} منتج</Text>
            <Text style={styles.sectionTitle}>جميع المنتجات</Text>
          </View>

          {filtered.length > 0 ? (
            <View style={styles.masonryContainer}>
              {/* العمود الأيمن (يبدأ متقدماً للأعلى) */}
              <View style={[styles.masonryColumn, styles.rightColumn]}>
                {rightColumnProducts.map((item: any) => (
                  <View key={item.id} style={styles.cardWrapper}>
                    <ProductCard
                      product={item}
                      onPress={() => navigation.navigate('Product', { product: item })}
                      onFavorite={() => user ? toggleFavorite(item.id) : navigation.navigate('Login')}
                      isFavorite={favoriteIds.has(item.id)}
                      onAddToCart={() => {
                        if (!user) return navigation.navigate('Login');
                      }}
                    />
                  </View>
                ))}
              </View>

              {/* العمود الأيسر (ينزل للأسفل بحافة علوية - Staggered Offset) */}
              <View style={[styles.masonryColumn, styles.leftColumn]}>
                {leftColumnProducts.map((item: any) => (
                  <View key={item.id} style={styles.cardWrapper}>
                    <ProductCard
                      product={item}
                      onPress={() => navigation.navigate('Product', { product: item })}
                      onFavorite={() => user ? toggleFavorite(item.id) : navigation.navigate('Login')}
                      isFavorite={favoriteIds.has(item.id)}
                      onAddToCart={() => {
                        if (!user) return navigation.navigate('Login');
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="shopping-bag" size={48} color={colors.border} />
              <Text style={styles.emptyText}>لا توجد منتجات</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },

  /* ── Header ── */
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerHello:  { fontSize: 11, color: colors.textSecondary },
  headerTitle:  { fontSize: 16, fontWeight: '800', color: colors.text },
  headerRight:  { flexDirection: 'row', gap: spacing.xs },
  headerIconBtn:{
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center',
  },

  /* ── Sticky Search Container ── */
  stickySearchContainer: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 42,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  filterBtn: {
    width: 42, height: 42, borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5, borderColor: colors.primary + '40',
    justifyContent: 'center', alignItems: 'center',
  },

  /* ── Top Banner Carousel ── */
  bannerSection: { marginTop: spacing.md },
  bannerCard: {
    width: BANNER_W,
    height: 170,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
    ...shadows.md,
  },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.md,
    alignItems: 'flex-end',
  },
  bannerTag: {
    fontSize: 10, fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.full,
    marginBottom: 4,
    overflow: 'hidden',
  },
  bannerTitle: {
    fontSize: 18, fontWeight: '800',
    color: colors.white, textAlign: 'right',
    marginBottom: spacing.xs, lineHeight: 22,
  },
  bannerBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full,
  },
  bannerBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  bannerPlaceholder: {
    height: 140, margin: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
  },
  bannerPlaceholderText: { fontSize: 13, color: colors.textMuted },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 5, marginTop: spacing.xs,
  },
  dot:       { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 16, height: 5, borderRadius: 3, backgroundColor: colors.primary },

  /* ── Categories ── */
  catList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  catItem:       { alignItems: 'center', gap: 4, width: 60 },
  catCircle: {
    width: 52, height: 52, borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
    ...shadows.sm,
  },
  catCircleActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  catCircleImg:    { width: '100%', height: '100%', borderRadius: radius.full },
  catName:         { fontSize: 10, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
  catNameActive:   { color: colors.primary, fontWeight: '700' },

  /* ── Section Header ── */
  section: { marginTop: spacing.lg },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.xs,
  },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: colors.text },
  viewAllBtn:    { flexDirection: 'row-reverse', alignItems: 'center', gap: 3 },
  viewAllText:   { fontSize: 12, color: colors.primary, fontWeight: '600' },
  productsCount: { fontSize: 12, color: colors.textMuted },

  /* ── Horizontal Scrollable Cards ── */
  horizontalListContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: 4,
  },
  cardHorizontal: {
    width: 115,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardImgBox: {
    height: 115,
    backgroundColor: colors.primaryLight,
    position: 'relative',
  },
  cardImg: { width: '100%', height: '100%' },
  cardPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardFavBtn: {
    position: 'absolute', top: 5, left: 5,
    width: 22, height: 22, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    ...shadows.sm,
  },
  cardInfo: { padding: spacing.xs, alignItems: 'flex-start' },
  cardName: { fontSize: 10, fontWeight: '700', color: colors.text, textAlign: 'right', width: '100%' },
  cardPrice: { fontSize: 11, fontWeight: '900', color: colors.accent, marginTop: 2, textAlign: 'right', width: '100%' },

  /* ── Middle Admin Banner ── */
  midBannerCard: {
    height: 110, borderRadius: radius.lg, overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  midBannerImg: { width: '100%', height: '100%' },
  midBannerOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
    padding: spacing.md,
    justifyContent: 'center', alignItems: 'flex-end',
  },
  midBannerTag: {
    fontSize: 9, 
    fontWeight: '700', 
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs, 
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  midBannerTitle: { fontSize: 14, fontWeight: '800', color: colors.white, textAlign: 'right' },
  midBannerPlaceholder: {
    height: 90, borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  midBannerPlaceholderText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },

  /* ── Products Masonry Grid (تخفيض/تداخل الكروت) ── */
  masonryContainer: {
    flexDirection: 'row-reverse', // الاتجاه RTL لدعم العربية
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  masonryColumn: {
    flex: 1,
  },
  rightColumn: {
    marginTop: 0, // العمود الأيمن ينطلق من الأعلى مباشرّة
  },
  leftColumn: {
    marginTop: 28, // إزاحة العمود الأيسر للأسفل لإعطاء مظهر متداخل أنيق (Staggered Layout)
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  empty:     { width: '100%', alignItems: 'center', paddingTop: 40, gap: spacing.md },
  emptyText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
});