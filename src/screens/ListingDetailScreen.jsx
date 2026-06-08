import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Image,
  TextInput, Alert
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    fetchListing();
  }, []);

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

  const getImage = (item) => {
    if (item.photos && item.photos.length > 0) {
      return { uri: item.photos[0].url };
    }
    const fallbacks = {
      APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      HOUSE: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      VILLA: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      CABIN: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
    };
    return { uri: fallbacks[item.type] || fallbacks.APARTMENT };
  };

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      Alert.alert('Required', 'Please enter check-in and check-out dates');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      Alert.alert('Invalid date', 'Please use format YYYY-MM-DD\nExample: 2026-07-01');
      return;
    }
    if (checkInDate <= today) {
      Alert.alert('Invalid date', 'Check-in must be in the future');
      return;
    }
    if (checkOutDate <= checkInDate) {
      Alert.alert('Invalid date', 'Check-out must be after check-in');
      return;
    }
    navigation.navigate('Checkout', {
      listing,
      checkIn,
      checkOut,
    });
  };

  const handleMessageHost = async () => {
    try {
      const res = await api.post('/messages/conversations', {
        hostId: listing.hostId || listing.host?.id,
        listingId: listing.id,
      });
      navigation.navigate('Chat', {
        conversationId: res.data.id,
        otherUserName: listing.host?.name || 'Host',
        listingTitle: listing.title,
      });
    } catch (err) {
      Alert.alert('Error', 'Could not start conversation');
    }
  };

  if (loading) return (
    <ActivityIndicator
      size="large"
      color="#FF385C"
      style={{ marginTop: 100 }}
    />
  );

  if (!listing) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Listing not found</Text>
    </View>
  );

  const nights = checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <ScrollView style={styles.container}>

      {/* Back Button */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Image */}
      <Image source={getImage(listing)} style={styles.image} />

      <View style={styles.body}>

        {/* Title & Info */}
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.location}>📍 {listing.location}</Text>
        <Text style={styles.price}>${listing.pricePerNight} / night</Text>
        <Text style={styles.type}>
          {listing.type} · Up to {listing.guests} guests
        </Text>
        <Text style={styles.description}>{listing.description}</Text>

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <View style={styles.amenities}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {listing.amenities.map((a, i) => (
              <Text key={i} style={styles.amenity}>✓ {a}</Text>
            ))}
          </View>
        )}

        {/* Host */}
        {listing.host && (
          <View style={styles.hostBox}>
            <Text style={styles.sectionTitle}>Host</Text>
            <Text style={styles.hostName}>👤 {listing.host.name}</Text>
          </View>
        )}

        {/* Reviews Button */}
        <TouchableOpacity
          style={styles.reviewsBtn}
          onPress={() => navigation.navigate('Reviews', { listingId: id })}>
          <Text style={styles.reviewsBtnText}>⭐ See Reviews</Text>
        </TouchableOpacity>

        {/* Message Host */}
        {user && user.role === 'GUEST' && (
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={handleMessageHost}>
            <Text style={styles.messageBtnText}>💬 Message Host</Text>
          </TouchableOpacity>
        )}

        {/* Booking Section */}
        {user && user.role === 'GUEST' && (
          <View style={styles.bookingBox}>
            <Text style={styles.sectionTitle}>Book this listing</Text>

            {/* Date Inputs */}
            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="2026-07-01"
                  value={checkIn}
                  onChangeText={setCheckIn}
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="2026-07-07"
                  value={checkOut}
                  onChangeText={setCheckOut}
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            {/* Price Preview */}
            {nights > 0 && (
              <View style={styles.pricePreview}>
                <Text style={styles.pricePreviewText}>
                  🌙 {nights} night{nights !== 1 ? 's' : ''} ·
                  💰 Total: ${listing.pricePerNight * nights}
                </Text>
              </View>
            )}

            {/* Reserve Button */}
           <TouchableOpacity
  style={styles.calendarBtn}
  onPress={() => navigation.navigate('Calendar', { listingId: id })}>
  <Text style={styles.calendarBtnText}>📅 Select Dates & Book</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.button} onPress={handleBook} disabled={booking}>
  {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Quick Book (Jun 1-7)</Text>}
</TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { padding: 16, paddingTop: 50 },
  backText: { color: '#FF385C', fontSize: 16 },
  image: { width: '100%', height: 280 },
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
    borderWidth: 1, borderColor: '#ddd',
    borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 12
  },
  reviewsBtnText: { color: '#222', fontWeight: '600', fontSize: 15 },
  messageBtn: {
    borderWidth: 1.5, borderColor: '#222',
    borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 16
  },
  messageBtnText: { color: '#222', fontSize: 15, fontWeight: '600' },
  bookingBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16, padding: 16, marginBottom: 20
  },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6 },
  dateInput: {
    borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 12,
    fontSize: 14, color: '#222', backgroundColor: '#fff'
  },
  pricePreview: {
    backgroundColor: '#fff0f3', borderRadius: 10,
    padding: 10, marginBottom: 12, alignItems: 'center'
  },
  pricePreviewText: { fontSize: 14, color: '#FF385C', fontWeight: '600' },
  button: {
    backgroundColor: '#FF385C', borderRadius: 12,
    padding: 16, alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  calendarBtn: {
  borderWidth: 1, borderColor: '#FF385C', borderRadius: 12,
  padding: 14, alignItems: 'center', marginBottom: 12
},
calendarBtnText: { color: '#FF385C', fontWeight: '600', fontSize: 15 },
});