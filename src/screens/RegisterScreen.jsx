import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api/api';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', username: '', phone: '', password: '', role: 'GUEST' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!form.name || !form.email || !form.username || !form.phone || !form.password) {
      setError('Please fill in all fields'); return;
    }
    try {
      setLoading(true);
      await api.post('/auth/register', form);
      setSuccess('Account created! Please login.');
      setTimeout(() => navigation.replace('Login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>airbnb</Text>
      <Text style={styles.title}>Create account</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      {['name', 'email', 'username', 'phone', 'password'].map(field => (
        <TextInput key={field} style={styles.input}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]} onChangeText={v => setForm({ ...form, [field]: v })}
          secureTextEntry={field === 'password'}
          keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
          autoCapitalize="none" placeholderTextColor="#aaa" />
      ))}
      <View style={styles.roleRow}>
        {['GUEST', 'HOST'].map(role => (
          <TouchableOpacity key={role}
            style={[styles.roleBtn, form.role === role && styles.roleBtnActive]}
            onPress={() => setForm({ ...form, role })}>
            <Text style={[styles.roleTxt, form.role === role && styles.roleTxtActive]}>{role}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Log in</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#FF385C', textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 24, color: '#222' },
  error: { backgroundColor: '#fff0f0', color: '#cc0000', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  success: { backgroundColor: '#f0fff4', color: '#00aa44', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, color: '#222' },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleBtn: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, alignItems: 'center' },
  roleBtnActive: { borderColor: '#FF385C', backgroundColor: '#fff0f3' },
  roleTxt: { color: '#666', fontWeight: '500' },
  roleTxtActive: { color: '#FF385C', fontWeight: '700' },
  button: { backgroundColor: '#FF385C', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#666', fontSize: 14 },
  linkBold: { color: '#FF385C', fontWeight: '600' }
});