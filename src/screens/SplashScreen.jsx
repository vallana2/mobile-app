import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    await new Promise(r => setTimeout(r, 2000));
    const token = await AsyncStorage.getItem('token');
    navigation.replace(token ? 'Main' : 'Welcome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>airbnb</Text>
      <Text style={styles.tagline}>Belong anywhere</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF385C', justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 18, color: '#fff', opacity: 0.9 }
});