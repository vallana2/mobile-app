import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator,
  Alert, Image
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const FALLBACKS = {
  APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  HOUSE: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  VILLA: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  CABIN: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
};

export default function CheckoutScreen({ route, navigation }) {
  const { listing, checkIn, checkOut } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const nightlyTotal = listing.pricePerNight * nights;
  const cleaningFee = Math.round(nightlyTotal * 0.1);
  const serviceFee = Math.round(nightlyTotal * 0.12);
  const taxes = Math.round(nightlyTotal * 0.08);
  const total = nightlyTotal + cleaningFee + serviceFee + taxes;

  const photo = listing.photos?.[0]?.url || FALLBACKS[listing.type] || FALLBACKS.APARTMENT;

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const handleConfirm = () => {
    navigation.navigate('Payment', {
      listing,
      checkIn,
      checkOut,
      total,
      bookingData: { checkIn, checkOut }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm & Pay</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Listing Card */}
        <View style={styles.listingCard}>
          <Image source={{ uri: photo }} style={styles.listingImage} />
          <View style={styles.listingInfo}>
            <Text style={styles.listingType}>{listing.type}</Text>
            <Text style={styles.listingTitle} numberOfLines={2}>
              {listing.title}
            </Text>
            <Text style={styles.listingLocation}>📍 {listing.location}</Text>
            {listing.rating && (
              <Text style={styles.listingRating}>⭐ {listing.rating}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Trip</Text>
          <View style={styles.tripRow}>
            <View style={styles.tripItem}>
              <Text style={styles.tripLabel}>Check-in</Text>
              <Text style={styles.tripValue}>{formatDate(checkIn)}</Text>
            </View>
            <View style={styles.tripDivider} />
            <View style={styles.tripItem}>
              <Text style={styles.tripLabel}>Check-out</Text>
              <Text style={styles.tripValue}>{formatDate(checkOut)}</Text>
            </View>
          </View>
          <View style={styles.tripNights}>
            <Text style={styles.tripNightsText}>
              🌙 {nights} night{nights !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              ${listing.pricePerNight} × {nights} night{nights !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.priceValue}>${nightlyTotal}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cleaning fee</Text>
            <Text style={styles.priceValue}>${cleaningFee}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee</Text>
            <Text style={styles.priceValue}>${serviceFee}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes</Text>
            <Text style={styles.priceValue}>${taxes}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total (USD)</Text>
            <Text style={styles.totalValue}>${total}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Guest Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest</Text>
          <View style={styles.guestRow}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarText}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.guestName}>{user?.name}</Text>
              <Text style={styles.guestEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <Text style={styles.policyText}>
            Free cancellation before check-in. Cancel before check-in for a full refund.
          </Text>
        </View>

        {/* Ground Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ground Rules</Text>
          <Text style={styles.ruleText}>• Follow the host's house rules</Text>
          <Text style={styles.ruleText}>• Treat the host's home with care</Text>
          <Text style={styles.ruleText}>• Leave the property clean</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>${total}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>Confirm & Pay</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  backBtn: { padding: 4, width: 40 },
  backText: { fontSize: 24, color: '#FF385C' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  listingCard: {
    flexDirection: 'row', padding: 20, gap: 14, alignItems: 'center'
  },
  listingImage: { width: 90, height: 90, borderRadius: 12 },
  listingInfo: { flex: 1 },
  listingType: { fontSize: 12, color: '#888', fontWeight: '500', marginBottom: 4 },
  listingTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  listingLocation: { fontSize: 13, color: '#666', marginBottom: 2 },
  listingRating: { fontSize: 13, color: '#222' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 20 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 16 },
  tripRow: {
    flexDirection: 'row', backgroundColor: '#f9f9f9',
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#eee'
  },
  tripItem: { flex: 1, padding: 16 },
  tripDivider: { width: 1, backgroundColor: '#eee' },
  tripLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 6 },
  tripValue: { fontSize: 15, fontWeight: '700', color: '#222' },
  tripNights: {
    marginTop: 12, backgroundColor: '#fff8f8',
    borderRadius: 10, padding: 10, alignItems: 'center'
  },
  tripNightsText: { fontSize: 14, color: '#FF385C', fontWeight: '600' },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5'
  },
  priceLabel: { fontSize: 15, color: '#444' },
  priceValue: { fontSize: 15, color: '#222', fontWeight: '500' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 14, marginTop: 4
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#222' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#222' },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  guestAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FF385C', justifyContent: 'center', alignItems: 'center'
  },
  guestAvatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  guestName: { fontSize: 15, fontWeight: '700', color: '#222' },
  guestEmail: { fontSize: 13, color: '#888', marginTop: 2 },
  policyText: { fontSize: 14, color: '#444', lineHeight: 22 },
  ruleText: { fontSize: 14, color: '#444', lineHeight: 26 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1,
    borderTopColor: '#f0f0f0', padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16
  },
  footerTotal: { flex: 1 },
  footerTotalLabel: { fontSize: 12, color: '#888' },
  footerTotalValue: { fontSize: 20, fontWeight: '700', color: '#222' },
  confirmBtn: {
    flex: 2, backgroundColor: '#FF385C',
    borderRadius: 14, padding: 16, alignItems: 'center'
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});