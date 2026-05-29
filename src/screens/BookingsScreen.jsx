import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function BookingsScreen({ navigation }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      const myBookings = res.data.filter(b => b.guest?.id === user?.id || b.guestId === user?.id);
      setBookings(myBookings);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'CONFIRMED') return '#00aa44';
    if (status === 'CANCELLED') return '#cc0000';
    return '#FF8C00';
  };

  const getStatusBg = (status) => {
    if (status === 'CONFIRMED') return '#f0fff4';
    if (status === 'CANCELLED') return '#fff0f0';
    return '#fff8f0';
  };

  if (loading) return (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color="#FF385C" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyIcon}>🧳</Text>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>
            When you book a place, it will appear here
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.exploreBtnText}>Explore listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.listing?.title || 'Listing'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardLocation}>
                📍 {item.listing?.location || 'Unknown location'}
              </Text>

              <View style={styles.datesRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Check-in</Text>
                  <Text style={styles.dateValue}>
                    {new Date(item.checkIn).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </Text>
                </View>
                <Text style={styles.dateSeparator}>→</Text>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Check-out</Text>
                  <Text style={styles.dateValue}>
                    {new Date(item.checkOut).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.totalPrice}>
                  Total: <Text style={styles.totalPriceBold}>${item.totalPrice}</Text>
                </Text>
                <Text style={styles.bookedOn}>
                  Booked {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20, paddingTop: 50,
    paddingBottom: 16, borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: { fontSize: 26, fontWeight: '700', color: '#222' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  exploreBtn: { backgroundColor: '#FF385C', borderRadius: 12, padding: 14, paddingHorizontal: 28 },
  exploreBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardLocation: { fontSize: 14, color: '#666', marginBottom: 12 },
  datesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f8f8f8', borderRadius: 12, padding: 12 },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#888', marginBottom: 2, textTransform: 'uppercase' },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#222' },
  dateSeparator: { fontSize: 18, color: '#888', marginHorizontal: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPrice: { fontSize: 14, color: '#444' },
  totalPriceBold: { fontWeight: '700', color: '#222', fontSize: 15 },
  bookedOn: { fontSize: 12, color: '#aaa' },
});