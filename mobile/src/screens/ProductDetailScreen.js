import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import { getProduct, addFavorite, removeFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
    const { productId } = route.params;
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [heartScale] = useState(new Animated.Value(1));

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await getProduct(productId);
            setProduct(res.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated) return;

        // Animate heart
        Animated.sequence([
            Animated.timing(heartScale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
            Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 40, friction: 3 }),
        ]).start();

        try {
            if (product.is_favorited) {
                await removeFavorite(product.id);
            } else {
                await addFavorite(product.id);
            }
            setProduct((prev) => ({ ...prev, is_favorited: !prev.is_favorited }));
        } catch (err) {
            console.error('Fav error:', err);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6c5ce7" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: product.image }} style={styles.image} />

            <View style={styles.content}>
                <View style={styles.categoryRow}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{product.category?.toUpperCase()}</Text>
                    </View>
                </View>

                <Text style={styles.title}>{product.title}</Text>
                <Text style={styles.price}>${product.price?.toFixed(2)}</Text>

                <Text style={styles.description}>{product.description}</Text>

                {product.seller_name && (
                    <View style={styles.sellerCard}>
                        <View style={styles.sellerAvatar}>
                            <Text style={styles.sellerAvatarText}>
                                {product.seller_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.sellerName}>{product.seller_name}</Text>
                            <Text style={styles.sellerLabel}>Seller</Text>
                        </View>
                    </View>
                )}

                {isAuthenticated && (
                    <TouchableOpacity
                        style={[styles.favButton, product.is_favorited && styles.favButtonActive]}
                        onPress={handleFavorite}
                        activeOpacity={0.8}
                    >
                        <Animated.Text style={[styles.favButtonIcon, { transform: [{ scale: heartScale }] }]}>
                            {product.is_favorited ? '❤️' : '🤍'}
                        </Animated.Text>
                        <Text style={[styles.favButtonText, product.is_favorited && styles.favButtonTextActive]}>
                            {product.is_favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.metaCard}>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Listed on</Text>
                        <Text style={styles.metaValue}>
                            {new Date(product.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Product ID</Text>
                        <Text style={styles.metaValue}>#{product.id}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: width,
        height: width * 0.85,
        backgroundColor: '#12121a',
    },
    content: {
        padding: 20,
    },
    categoryRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: 'rgba(108,92,231,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    categoryText: {
        color: '#a29bfe',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#f0f0f5',
        marginBottom: 8,
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    price: {
        fontSize: 30,
        fontWeight: '900',
        color: '#a29bfe',
        marginBottom: 20,
    },
    description: {
        fontSize: 15,
        color: '#a0a0b8',
        lineHeight: 24,
        marginBottom: 24,
    },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2a2a45',
    },
    sellerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fd79a8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sellerAvatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    sellerName: {
        color: '#f0f0f5',
        fontSize: 15,
        fontWeight: '600',
    },
    sellerLabel: {
        color: '#6c6c88',
        fontSize: 12,
    },
    favButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#2a2a45',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        gap: 10,
    },
    favButtonActive: {
        backgroundColor: '#fd79a8',
        borderColor: '#fd79a8',
    },
    favButtonIcon: {
        fontSize: 20,
    },
    favButtonText: {
        color: '#f0f0f5',
        fontSize: 15,
        fontWeight: '600',
    },
    favButtonTextActive: {
        color: 'white',
    },
    metaCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2a2a45',
        marginBottom: 30,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    metaLabel: {
        color: '#6c6c88',
        fontSize: 13,
    },
    metaValue: {
        color: '#a0a0b8',
        fontSize: 13,
    },
    errorText: {
        color: '#ff6b81',
        fontSize: 16,
    },
});
