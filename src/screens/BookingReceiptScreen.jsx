import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';

export default function BookingReceiptScreen({ route, navigation }) {
  const { booking } = route.params;

  const getReference = (id) => 'AIR-' + id.substring(0, 8).toUpperCase();

  const nights = Math.ceil(
    (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)
  );

  const pricePerNight = booking.listing?.pricePerNight || 0;
  const serviceFee = Math.round(booking.totalPrice * 0.12);
  const subtotal = booking.totalPrice - serviceFee;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Receipt Header */}
      <View style={styles.receiptHeader}>
        <Text style={styles.logo}>airbnb</Text>
        <Text style={styles.receiptTitle}>Booking Confirmed!</Text>
        <Text style={styles.receiptSubtitle}>Your trip is booked</Text>
        <View style={styles.checkIcon}>
          <Text style={{ fontSize: 40 }}>✅</Text>
        </View>
      </View>

      {/* Reference Number */}
      <View style={styles.referenceBox}>
        <Text style={styles.referenceLabel}>Booking Reference</Text>
        <Text style={styles.referenceNumber}>{getReference(booking.id)}</Text>
        <Text style={styles.referenceHint}>Show this to your host</Text>
      </View>

      {/* Property Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Property</Text>
          <Text style={styles.rowValue}>{booking.listing?.title || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Location</Text>
          <Text style={styles.rowValue}>{booking.listing?.location || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Type</Text>
          <Text style={styles.rowValue}>{booking.listing?.type || 'N/A'}</Text>
        </View>
      </View>

      {/* Stay Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stay Details</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Check-in</Text>
          <Text style={styles.rowValue}>
            {new Date(booking.checkIn).toLocaleDateString('en-US', {
              weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Check-out</Text>
          <Text style={styles.rowValue}>
            {new Date(booking.checkOut).toLocaleDateString('en-US', {
              weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Duration</Text>
          <Text style={styles.rowValue}>{nights} night(s)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={[styles.rowValue,
            { color: booking.status === 'CONFIRMED' ? '#00aa44' : '#FF8C00' }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      {/* Price Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>${pricePerNight} × {nights} nights</Text>
          <Text style={styles.rowValue}>${subtotal}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Service fee (12%)</Text>
          <Text style={styles.rowValue}>${serviceFee}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${booking.totalPrice}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Trips')}>
        <Text style={styles.doneBtnText}>View All Trips</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { padding: 16, paddingTop: 50 },
  backText: { color: '#FF385C', fontSize: 16 },
  receiptHeader: {
    alignItems: 'center', padding: 24,
    backgroundColor: '#FF385C', marginBottom: 0
  },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  receiptTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  receiptSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  checkIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  referenceBox: {
    backgroundColor: '#fff8f0', margin: 16, borderRadius: 16,
    padding: 20, alignItems: 'center',
    borderWidth: 2, borderColor: '#FF385C', borderStyle: 'dashed'
  },
  referenceLabel: { fontSize: 13, color: '#888', marginBottom: 8 },
  referenceNumber: { fontSize: 28, fontWeight: '700', color: '#FF385C', letterSpacing: 2 },
  referenceHint: { fontSize: 12, color: '#aaa', marginTop: 8 },
  section: { margin: 16, backgroundColor: '#f8f8f8', borderRadius: 16, padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowLabel: { fontSize: 14, color: '#666' },
  rowValue: { fontSize: 14, fontWeight: '500', color: '#222', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#222' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#FF385C' },
  doneBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    margin: 16, padding: 16, alignItems: 'center', marginBottom: 40
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});