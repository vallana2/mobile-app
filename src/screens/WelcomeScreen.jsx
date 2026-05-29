import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' }}
        style={styles.bgImage}
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.logo}>airbnb</Text>
        <Text style={styles.title}>Belong anywhere</Text>
        <Text style={styles.subtitle}>
          Find unique places to stay and things to do all over the world
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerBtnText}>Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Text style={styles.guestText}>Continue as guest →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgImage: { position: 'absolute', width: '100%', height: '100%' },
  overlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.45)' },
  content: { flex: 1, justifyContent: 'flex-end', padding: 32, paddingBottom: 60 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 12 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 40, lineHeight: 24 },
  loginBtn: { backgroundColor: '#FF385C', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  registerBtnText: { color: '#FF385C', fontSize: 16, fontWeight: '700' },
  guestText: { color: '#fff', textAlign: 'center', fontSize: 14, opacity: 0.8 }
});