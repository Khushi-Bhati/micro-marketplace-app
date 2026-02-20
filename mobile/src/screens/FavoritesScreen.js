import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { getFavorites, removeFavorite } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function FavoritesScreen({ navigation }) {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await getFavorites({ limit: 50 });
            setFavorites(res.data.favorites);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await removeFavorite(productId);
            setFavorites((prev) => prev.filter((p) => p.id !== productId));
        } catch (err) {
            console.error('Remove error:', err);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardPrice}>${item.price?.toFixed(2)}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
                <Text style={styles.removeIcon}>❤️</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6c5ce7" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>❤️ My Favorites</Text>
            <Text style={styles.subheader}>
                {favorites.length} saved item{favorites.length !== 1 ? 's' : ''}
            </Text>

            {favorites.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💫</Text>
                    <Text style={styles.emptyTitle}>No favorites yet</Text>
                    <Text style={styles.emptySubtitle}>Start exploring and save products you love!</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: '800',
        color: '#f0f0f5',
        marginTop: 16,
    },
    subheader: {
        color: '#a0a0b8',
        fontSize: 14,
        marginBottom: 20,
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderRadius: 14,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a45',
        alignItems: 'center',
    },
    cardImage: {
        width: 90,
        height: 90,
        backgroundColor: '#12121a',
    },
    cardBody: {
        flex: 1,
        padding: 12,
    },
    cardTitle: {
        color: '#f0f0f5',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardPrice: {
        color: '#a29bfe',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    cardCategory: {
        color: '#6c6c88',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    removeBtn: {
        padding: 16,
    },
    removeIcon: {
        fontSize: 22,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        color: '#f0f0f5',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySubtitle: {
        color: '#a0a0b8',
        fontSize: 14,
        textAlign: 'center',
    },
});
