

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Image
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchListing(); }, []);

  const fetchListing = async () => {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setError(''); setSuccess('');
    try {
      setBooking(true);
      await api.post('/bookings', {
        listingId: id,
        checkIn: '2026-06-01',
        checkOut: '2026-06-07'
      });
      setSuccess('Booking created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };
  const getImage = (listing) => {
  if (listing.photos && listing.photos.length > 0) {
    return { uri: listing.photos[0].url };
  }
  // Fallback to Unsplash based on listing type
  const fallbacks = {
    APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    HOUSE: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
    VILLA: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    CABIN: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
  };
  return { uri: fallbacks[listing.type] || fallbacks.APARTMENT };
};

  if (loading) return (
    <ActivityIndicator size="large" color="#FF385C" style={{ marginTop: 100 }} />
  );

  if (!listing) return (
    <Text style={{ textAlign: 'center', marginTop: 100 }}>Not found</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {listing.photos && listing.photos[0] && listing.photos[0].url ? (
        <Image source={{ uri: listing.photos[0].url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ fontSize: 64 }}>🏠</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.location}>📍 {listing.location}</Text>
        <Text style={styles.price}>${listing.pricePerNight} / night</Text>
        <Text style={styles.type}>{listing.type} · Up to {listing.guests} guests</Text>
        <Text style={styles.description}>{listing.description}</Text>

        {listing.amenities && listing.amenities.length > 0 ? (
          <View style={styles.amenities}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {listing.amenities.map((a, i) => (
              <Text key={i} style={styles.amenity}>✓ {a}</Text>
            ))}
          </View>
        ) : null}

        {listing.host ? (
          <View style={styles.hostBox}>
            <Text style={styles.sectionTitle}>Host</Text>
            <Text style={styles.hostName}>👤 {listing.host.name}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.reviewsBtn}
          onPress={() => navigation.navigate('Reviews', { listingId: id })}>
          <Text style={styles.reviewsBtnText}>💬 See Reviews</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        {user && user.role === 'GUEST' ? (
          <View style={styles.bookingBox}>
            <Text style={styles.sectionTitle}>Book this listing</Text>
            <Text style={styles.dateLabel}>Check-in: June 1, 2026</Text>
            <Text style={styles.dateLabel}>Check-out: June 7, 2026</Text>
            <Text style={styles.totalPrice}>
              Total: ${listing.pricePerNight * 6}
            </Text>
           <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate('Checkout', {
    listing: listing,
    checkIn: '2026-06-01',
    checkOut: '2026-06-07',
  })}>
  <Text style={styles.buttonText}>Reserve</Text>
</TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { padding: 16, paddingTop: 50 },
  backText: { color: '#FF385C', fontSize: 16 },
  image: { width: '100%', height: 280 },
  imagePlaceholder: {
    width: '100%', height: 280, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center'
  },
  body: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  location: { fontSize: 15, color: '#666', marginBottom: 4 },
  price: { fontSize: 20, fontWeight: '700', color: '#FF385C', marginBottom: 4 },
  type: { fontSize: 14, color: '#888', marginBottom: 12 },
  description: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 20 },
  amenities: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 10 },
  amenity: { fontSize: 14, color: '#444', marginBottom: 4 },
  hostBox: { marginBottom: 20 },
  hostName: { fontSize: 15, color: '#444' },
  reviewsBtn: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    padding: 14, alignItems: 'center', marginBottom: 16
  },
  reviewsBtnText: { color: '#222', fontWeight: '600', fontSize: 15 },
  error: {
    backgroundColor: '#fff0f0', color: '#cc0000', padding: 12,
    borderRadius: 8, marginBottom: 12, textAlign: 'center'
  },
  success: {
    backgroundColor: '#f0fff4', color: '#00aa44', padding: 12,
    borderRadius: 8, marginBottom: 12, textAlign: 'center'
  },
  bookingBox: { backgroundColor: '#f8f8f8', borderRadius: 16, padding: 16, marginBottom: 40 },
  dateLabel: { fontSize: 14, color: '#444', marginBottom: 4 },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12, marginTop: 8 },
  button: { backgroundColor: '#FF385C', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});