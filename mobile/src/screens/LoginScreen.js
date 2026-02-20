import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../services/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const res = await loginApi({ email, password });
            await loginUser(res.data.user, res.data.token);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.brandIcon}>🛍️</Text>
                    <Text style={styles.title}>MicroMart</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                {error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="john@example.com"
                        placeholderTextColor="#6c6c88"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#6c6c88"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.testCreds}>
                    <Text style={styles.testCredsTitle}>Test Credentials</Text>
                    <Text style={styles.testCredsText}>john@example.com / password123</Text>
                    <Text style={styles.testCredsText}>jane@example.com / password123</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    brandIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#a29bfe',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: '#a0a0b8',
    },
    errorBox: {
        backgroundColor: 'rgba(255,71,87,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,71,87,0.2)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#ff6b81',
        fontSize: 14,
    },
    form: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#a0a0b8',
        marginBottom: 6,
        marginTop: 12,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: '#16162a',
        borderWidth: 1,
        borderColor: '#2a2a45',
        borderRadius: 12,
        padding: 14,
        color: '#f0f0f5',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#6c5ce7',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    testCreds: {
        backgroundColor: 'rgba(108,92,231,0.1)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    testCredsTitle: {
        color: '#a29bfe',
        fontWeight: '700',
        fontSize: 13,
        marginBottom: 6,
    },
    testCredsText: {
        color: '#a0a0b8',
        fontSize: 12,
        marginBottom: 2,
    },
});
