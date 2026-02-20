import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Animated,
} from 'react-native';
import { getProducts, addFavorite, removeFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen({ navigation }) {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const fetchProducts = useCallback(async (pg = 1, isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const params = { page: pg, limit: 10 };
            if (search) params.search = search;
            const res = await getProducts(params);
            if (pg === 1) {
                setProducts(res.data.products);
            } else {
                setProducts((prev) => [...prev, ...res.data.products]);
            }
            setTotalPages(res.data.pagination.totalPages);
        } catch (err) {
            console.error('Error:', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search]);

    useEffect(() => {
        setPage(1);
        fetchProducts(1);
    }, [search]);

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchProducts(1, true);
    };

    const handleLoadMore = () => {
        if (page < totalPages && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage);
        }
    };

    const handleSearchChange = (text) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => setSearch(text), 500));
    };

    const toggleFavorite = async (product) => {
        if (!isAuthenticated) return;
        try {
            if (product.is_favorited) {
                await removeFavorite(product.id);
            } else {
                await addFavorite(product.id);
            }
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === product.id ? { ...p, is_favorited: !p.is_favorited } : p
                )
            );
        } catch (err) {
            console.error('Fav error:', err);
        }
    };

    const renderProduct = ({ item, index }) => {
        const scaleAnim = new Animated.Value(0);
        Animated.spring(scaleAnim, {
            toValue: 1,
            delay: index * 80,
            useNativeDriver: true,
            tension: 40,
            friction: 8,
        }).start();

        return (
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                >
                    <Image source={{ uri: item.image }} style={styles.cardImage} />
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    {isAuthenticated && (
                        <TouchableOpacity
                            style={[styles.favBtn, item.is_favorited && styles.favBtnActive]}
                            onPress={() => toggleFavorite(item)}
                        >
                            <Text style={styles.favIcon}>{item.is_favorited ? '❤️' : '🤍'}</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.cardPrice}>${item.price?.toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor="#6c6c88"
                    onChangeText={handleSearchChange}
                />
            </View>

            {loading && page === 1 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6c5ce7" />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#6c5ce7"
                            colors={['#6c5ce7']}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        loading && page > 1 ? (
                            <ActivityIndicator style={{ marginVertical: 20 }} color="#6c5ce7" />
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📦</Text>
                            <Text style={styles.emptyTitle}>No products found</Text>
                            <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 14,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#2a2a45',
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        padding: 14,
        color: '#f0f0f5',
        fontSize: 15,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#1a1a2e',
        borderRadius: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a45',
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#12121a',
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(10,10,15,0.75)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    categoryText: {
        color: '#e0e0f0',
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    favBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(10,10,15,0.6)',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    favBtnActive: {
        backgroundColor: '#fd79a8',
        borderColor: '#fd79a8',
    },
    favIcon: {
        fontSize: 14,
    },
    cardBody: {
        padding: 12,
    },
    cardTitle: {
        color: '#f0f0f5',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        lineHeight: 18,
    },
    cardPrice: {
        color: '#a29bfe',
        fontSize: 16,
        fontWeight: '800',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#6c6c88',
        marginTop: 12,
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        color: '#f0f0f5',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySubtitle: {
        color: '#a0a0b8',
        fontSize: 14,
    },
});
