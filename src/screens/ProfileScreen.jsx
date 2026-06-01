import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, SafeAreaView,
  ActivityIndicator, Alert, Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    try {
      setLoading(true);
      const res = await api.put(`/users/${user.id}`, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar.trim(),
      });
      updateUser(res.data);
      setEditing(false);
      Alert.alert('✅ Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    });
    setEditing(false);
  };

  if (!user) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.title}>Not logged in</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => editing ? handleCancel() : setEditing(true)}>
            <Text style={styles.editBtnText}>
              {editing ? 'Cancel' : '✏️ Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          {user.avatar || form.avatar ? (
            <Image
              source={{ uri: editing ? form.avatar : user.avatar }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
          {user.bio && !editing && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        {/* Edit Form */}
        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.formTitle}>Edit Profile</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={v => setForm({ ...form, name: v })}
              placeholder="Your full name"
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={v => setForm({ ...form, phone: v })}
              placeholder="+250780000000"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.bio}
              onChangeText={v => setForm({ ...form, bio: v })}
              placeholder="Tell guests about yourself..."
              placeholderTextColor="#aaa"
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Avatar URL</Text>
            <TextInput
              style={styles.input}
              value={form.avatar}
              onChangeText={v => setForm({ ...form, avatar: v })}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#aaa"
              autoCapitalize="none"
            />

            {form.avatar ? (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <Image
                  source={{ uri: form.avatar }}
                  style={styles.previewImg}
                />
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        ) : (
          /* Info Box */
          <View style={styles.infoBox}>
            {[
              ['📧 Email', user.email],
              ['👤 Username', `@${user.username}`],
              ['📱 Phone', user.phone || 'Not set'],
              ['📝 Bio', user.bio || 'No bio yet'],
              ['🗓️ Member since', new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })],
            ].map(([label, value]) => (
              <View key={label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {!editing && (
          <View style={styles.actions}>

            {/* Notifications */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.getParent()?.navigate('Notifications')}>
              <Text style={styles.actionIcon}>🔔</Text>
              <Text style={styles.actionText}>Notifications</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            {/* HOST only */}
            {user.role === 'HOST' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('CreateListing')}>
                <Text style={styles.actionIcon}>🏠</Text>
                <Text style={styles.actionText}>Create New Listing</Text>
                <Text style={styles.actionArrow}>›</Text>
              </TouchableOpacity>
            )}

            {/* Change Password */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert('Change Password', 'Use forgot password on login screen to reset your password.')}>
              <Text style={styles.actionIcon}>🔒</Text>
              <Text style={styles.actionText}>Change Password</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert('Airbnb Mobile', 'Version 1.0.0\nBuilt with React Native & Expo')}>
              <Text style={styles.actionIcon}>ℹ️</Text>
              <Text style={styles.actionText}>About App</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.logoutRow]}
              onPress={handleLogout}>
              <Text style={styles.actionIcon}>🚪</Text>
              <Text style={[styles.actionText, { color: '#FF385C' }]}>Logout</Text>
              <Text style={[styles.actionArrow, { color: '#FF385C' }]}>›</Text>
            </TouchableOpacity>
            {user.role === 'HOST' && (
  <TouchableOpacity
    style={styles.actionBtn}
    onPress={() => navigation.navigate('HostDashboard')}>
    <Text style={styles.actionIcon}>📊</Text>
    <Text style={styles.actionText}>Host Dashboard</Text>
    <Text style={styles.actionArrow}>›</Text>
  </TouchableOpacity>
)}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#222' },
  editBtn: {
    borderWidth: 1, borderColor: '#FF385C',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6
  },
  editBtnText: { color: '#FF385C', fontWeight: '600', fontSize: 14 },

  avatarSection: { alignItems: 'center', padding: 24 },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    marginBottom: 12, borderWidth: 2, borderColor: '#FF385C'
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FF385C', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12
  },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 8 },
  roleBadge: {
    backgroundColor: '#FF385C', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8
  },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  bio: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

  editForm: {
    margin: 20, backgroundColor: '#f9f9f9',
    borderRadius: 16, padding: 16
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 12, padding: 14, fontSize: 15,
    color: '#222', marginBottom: 16
  },
  previewBox: { marginBottom: 16 },
  previewLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  previewImg: { width: '100%', height: 160, borderRadius: 12 },
  saveBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 4
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  infoBox: {
    marginHorizontal: 20, backgroundColor: '#f8f8f8',
    borderRadius: 16, padding: 4, marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  infoLabel: { color: '#888', fontSize: 14, flex: 1 },
  infoValue: { color: '#222', fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },

  actions: { marginHorizontal: 20, marginTop: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5'
  },
  actionIcon: { fontSize: 20, marginRight: 14 },
  actionText: { flex: 1, fontSize: 15, color: '#222', fontWeight: '500' },
  actionArrow: { fontSize: 20, color: '#ccc' },
  logoutRow: { borderBottomWidth: 0 },

  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  button: {
    backgroundColor: '#FF385C', borderRadius: 12,
    padding: 16, alignItems: 'center', paddingHorizontal: 40
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});