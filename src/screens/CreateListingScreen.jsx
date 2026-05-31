import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export default function CreateListingScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    guests: '',
    type: 'APARTMENT',
    amenities: 'wifi, kitchen, parking',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreate = async () => {
    setError('');

    if (!form.title || !form.description || !form.location || !form.pricePerNight || !form.guests) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      // ✅ Step 1 — Create listing
      const res = await api.post('/listings', {
        title: form.title,
        description: form.description,
        location: form.location,
        pricePerNight: Number(form.pricePerNight),
        guests: Number(form.guests),
        type: form.type,
        amenities: form.amenities.split(',').map(a => a.trim())
      });

      const listingId = res.data.id;

      // ✅ Step 2 — Save photo URL to DATABASE
      if (form.photoUrl && listingId) {
        try {
          await api.post(`/listings/${listingId}/photos/url`, {
            url: form.photoUrl,
            publicId: 'external'
          });
        } catch (photoErr) {
          console.log('Photo save error:', photoErr);
        }

        // ✅ Also save locally as backup
        try {
          const stored = await AsyncStorage.getItem('photoUrls');
          const photoUrls = stored ? JSON.parse(stored) : {};
          photoUrls[listingId] = form.photoUrl;
          await AsyncStorage.setItem('photoUrls', JSON.stringify(photoUrls));
        } catch (storageErr) {
          console.log('AsyncStorage error:', storageErr);
        }
      }

      setSuccess('Listing created successfully! 🎉');
      setTimeout(() => navigation.goBack(), 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Create Listing</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Cozy Apartment in Kigali"
        value={form.title}
        onChangeText={v => setForm({ ...form, title: v })}
        placeholderTextColor="#aaa"
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Describe your place..."
        value={form.description}
        onChangeText={v => setForm({ ...form, description: v })}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#aaa"
      />

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Kigali, Rwanda"
        value={form.location}
        onChangeText={v => setForm({ ...form, location: v })}
        placeholderTextColor="#aaa"
      />

      {/* Price */}
      <Text style={styles.label}>Price per night ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 80"
        value={form.pricePerNight}
        onChangeText={v => setForm({ ...form, pricePerNight: v })}
        keyboardType="numeric"
        placeholderTextColor="#aaa"
      />

      {/* Guests */}
      <Text style={styles.label}>Max Guests</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 4"
        value={form.guests}
        onChangeText={v => setForm({ ...form, guests: v })}
        keyboardType="numeric"
        placeholderTextColor="#aaa"
      />

      {/* Property Type */}
      <Text style={styles.label}>Property Type</Text>
      <View style={styles.typeRow}>
        {['APARTMENT', 'HOUSE', 'VILLA', 'CABIN'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
            onPress={() => setForm({ ...form, type: t })}>
            <Text style={[styles.typeTxt, form.type === t && styles.typeTxtActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amenities */}
      <Text style={styles.label}>Amenities</Text>
      <TextInput
        style={styles.input}
        placeholder="wifi, kitchen, parking, pool, gym"
        value={form.amenities}
        onChangeText={v => setForm({ ...form, amenities: v })}
        placeholderTextColor="#aaa"
      />

      {/* Photo URL */}
      <Text style={styles.label}>📷 Photo URL</Text>
      <TextInput
        style={styles.input}
        placeholder="https://images.unsplash.com/photo-..."
        value={form.photoUrl}
        onChangeText={v => setForm({ ...form, photoUrl: v })}
        placeholderTextColor="#aaa"
        autoCapitalize="none"
      />

      {/* Photo Preview */}
      {form.photoUrl ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Photo Preview:</Text>
          <Image
            source={{ uri: form.photoUrl }}
            style={styles.preview}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={styles.photoHint}>
          <Text style={styles.photoHintText}>
            💡 Use a URL from Unsplash:{'\n'}
            https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleCreate}
        disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Create Listing</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24 },
  back: { marginBottom: 16, paddingTop: 30 },
  backText: { color: '#FF385C', fontSize: 16 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 24 },
  error: {
    backgroundColor: '#fff0f0', color: '#cc0000',
    padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center'
  },
  success: {
    backgroundColor: '#f0fff4', color: '#00aa44',
    padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center'
  },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    padding: 16, marginBottom: 20, fontSize: 16, color: '#222'
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeBtn: {
    borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 8, paddingHorizontal: 12
  },
  typeBtnActive: { borderColor: '#FF385C', backgroundColor: '#fff0f3' },
  typeTxt: { color: '#666', fontSize: 12, fontWeight: '500' },
  typeTxtActive: { color: '#FF385C', fontWeight: '700' },
  previewBox: { marginBottom: 20 },
  previewLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  preview: { width: '100%', height: 220, borderRadius: 12 },
  photoHint: {
    backgroundColor: '#f8f8f8', borderRadius: 12,
    padding: 14, marginBottom: 20
  },
  photoHintText: { fontSize: 12, color: '#888', lineHeight: 20 },
  button: {
    backgroundColor: '#FF385C', borderRadius: 12,
    padding: 16, alignItems: 'center',
    marginTop: 8, marginBottom: 40
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});