import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  if (!user) return (
    <View style={styles.container}>
      <Text style={styles.title}>Not logged in</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <Text style={styles.avatar}>👤</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.role}>{user.role}</Text>
      <View style={styles.infoBox}>
        {[['Email', user.email], ['Username', `@${user.username}`], ['Phone', user.phone]].map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>
      {user.role === 'HOST' && (
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateListing')}>
          <Text style={styles.createBtnText}>+ Create New Listing</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  avatarBox: { alignItems: 'center', marginBottom: 16 },
  avatar: { fontSize: 80 },
  name: { fontSize: 24, fontWeight: '700', color: '#222', textAlign: 'center', marginBottom: 4 },
  role: { fontSize: 14, color: '#fff', textAlign: 'center', backgroundColor: '#FF385C', alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 24 },
  infoBox: { backgroundColor: '#f8f8f8', borderRadius: 16, padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#222', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  createBtn: { backgroundColor: '#FF385C', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutBtn: { borderWidth: 1, borderColor: '#FF385C', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutBtnText: { color: '#FF385C', fontSize: 16, fontWeight: '600' }
});