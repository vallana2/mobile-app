import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { saveNotification } from '../utils/notifications';

export default function BookingsScreen({ navigation }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchBookings);
    return unsubscribe;
  }, [navigation]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      const data = res.data.bookings || res.data.data || res.data || [];
      const myBookings = Array.isArray(data)
        ? data.filter(b => b.guest?.id === user?.id || b.guestId === user?.id)
        : [];
      setBookings(myBookings);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (item) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking at ${item.listing?.title || 'this listing'}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(item.id);
              await api.delete(`/bookings/${item.id}`);
              await saveNotification({
                type: 'BOOKING_CANCELLED',
                title: 'Booking Cancelled ❌',
                message: `Your booking at ${item.listing?.title || 'listing'} has been cancelled.`,
                icon: '❌',
              });
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
              fetchBookings();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel booking.');
            } finally {
              setCancelling(null);
            }
          }
        }
      ]
    );
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
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.getParent()?.navigate('Notifications')}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
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
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchBookings}
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
                <Text style={styles.dateSeparator}>{'-->'}</Text>
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

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => navigation.navigate('ListingDetail', {
                    id: item.listing?.id || item.listingId
                  })}>
                  <Text style={styles.detailBtnText}>View Listing</Text>
                </TouchableOpacity>

                {item.status !== 'CANCELLED' && (
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      cancelling === item.id && { opacity: 0.6 }
                    ]}
                    onPress={() => handleCancel(item)}
                    disabled={cancelling === item.id}>
                    {cancelling === item.id ? (
                      <ActivityIndicator color="#FF385C" size="small" />
                    ) : (
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    )}
                  </TouchableOpacity>
                )}
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
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 50, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  title: { fontSize: 26, fontWeight: '700', color: '#222' },
  notifBtn: { padding: 4 },
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
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardLocation: { fontSize: 14, color: '#666', marginBottom: 12 },
  datesRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, backgroundColor: '#f8f8f8',
    borderRadius: 12, padding: 12
  },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 11, color: '#888', marginBottom: 2, textTransform: 'uppercase' },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#222' },
  dateSeparator: { fontSize: 18, color: '#888', marginHorizontal: 8 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12
  },
  totalPrice: { fontSize: 14, color: '#444' },
  totalPriceBold: { fontWeight: '700', color: '#222', fontSize: 15 },
  bookedOn: { fontSize: 12, color: '#aaa' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  detailBtn: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 10, alignItems: 'center'
  },
  detailBtnText: { fontSize: 14, fontWeight: '600', color: '#444' },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#FF385C',
    borderRadius: 10, padding: 10, alignItems: 'center'
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#FF385C' },
});