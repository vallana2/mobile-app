import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Switch, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function ProfileScreen({ navigation }) {
  const { user, login, logout } = useAuth();
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const handleSwitchRole = async () => {
    const newRole = user.role === 'GUEST' ? 'HOST' : 'GUEST';
    try {
      setSwitching(true);
      await api.put(`/users/${user.id}`, { role: newRole });
      const updatedUser = { ...user, role: newRole };
      await login(null, updatedUser);
      Alert.alert('Success', `Switched to ${newRole} mode!`);
    } catch (err) {
      Alert.alert('Error', 'Failed to switch role');
    } finally {
      setSwitching(false);
    }
  };

  if (!user) return (
    <View style={styles.container}>
      <Text style={styles.title}>Not logged in</Text>
      <TouchableOpacity style={styles.button}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.avatarBox}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={[styles.roleBadge,
          { backgroundColor: user.role === 'HOST' ? '#FF385C' : '#00aa44' }]}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>

      {/* Switch Role */}
      <View style={styles.switchCard}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchTitle}>
              {user.role === 'GUEST' ? '🏠 Become a Host' : '🧳 Switch to Guest'}
            </Text>
            <Text style={styles.switchSubtitle}>
              {user.role === 'GUEST'
                ? 'Start listing your place and earn money'
                : 'Switch back to explore and book places'}
            </Text>
          </View>
          {switching
            ? <ActivityIndicator color="#FF385C" />
            : <Switch
                value={user.role === 'HOST'}
                onValueChange={handleSwitchRole}
                trackColor={{ false: '#ddd', true: '#FF385C' }}
                thumbColor="#fff"
              />
          }
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        {[
          ['Email', user.email],
          ['Username', `@${user.username}`],
          ['Phone', user.phone],
        ].map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      {user.role === 'HOST' ? (
        <TouchableOpacity style={styles.actionBtn}
          onPress={() => navigation.navigate('HostDashboard')}>
          <Text style={styles.actionBtnText}>📊 Host Dashboard</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity style={styles.actionBtn}
        onPress={() => navigation.navigate('Notifications')}>
        <Text style={styles.actionBtnText}>🔔 Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionBtn}
        onPress={() => navigation.navigate('Safety')}>
        <Text style={styles.actionBtnText}>🛡️ Safety</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  avatarBox: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FF385C', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  roleBadge: {
    paddingHorizontal: 16, paddingVertical: 4,
    borderRadius: 20
  },
  roleText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  switchCard: {
    backgroundColor: '#f8f8f8', borderRadius: 16,
    padding: 16, marginBottom: 16
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  switchSubtitle: { fontSize: 13, color: '#888', maxWidth: 220 },
  infoBox: {
    backgroundColor: '#f8f8f8', borderRadius: 16,
    padding: 16, marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#222', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#FF385C', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionBtn: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 12,
    padding: 14, marginBottom: 12
  },
  actionBtnText: { color: '#222', fontSize: 15, fontWeight: '500' },
  logoutBtn: {
    borderWidth: 1, borderColor: '#FF385C', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8
  },
  logoutBtnText: { color: '#FF385C', fontSize: 16, fontWeight: '600' }
});