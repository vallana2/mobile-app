import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Image, ScrollView
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const FALLBACKS = {
  APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  HOUSE: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  VILLA: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  CABIN: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
};

export default function HostDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [stats, setStats] = useState({
    totalListings: 0,
    totalBookings: 0,
    totalEarnings: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchListings(), fetchBookings()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get(`/users/${user.id}/listings`);
      const data = res.data.listings || res.data.data || res.data || [];
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Listings error:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      const data = res.data.bookings || res.data.data || res.data || [];
      const allBookings = Array.isArray(data) ? data : [];

      // Filter bookings for host's listings
      const hostBookings = allBookings.filter(
        b => b.listing?.hostId === user.id || b.hostId === user.id
      );
      setBookings(hostBookings);

      // Calculate stats
      const earnings = hostBookings
        .filter(b => b.status === 'CONFIRMED')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      const pending = hostBookings.filter(b => b.status === 'PENDING').length;

      setStats({
        totalListings: listings.length,
        totalBookings: hostBookings.length,
        totalEarnings: earnings,
        pendingBookings: pending,
      });
    } catch (err) {
      console.log('Bookings error:', err);
    }
  };

  const handleDeleteListing = (item) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/listings/${item.id}`);
              Alert.alert('✅ Deleted', 'Listing deleted successfully.');
              fetchListings();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete listing');
            }
          }
        }
      ]
    );
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      Alert.alert('✅ Updated', `Booking ${status.toLowerCase()} successfully!`);
      fetchBookings();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update booking');
    }
  };

  const getPhoto = (item) => {
    if (item.photos && item.photos[0]?.url) return item.photos[0].url;
    return FALLBACKS[item.type] || FALLBACKS.APARTMENT;
  };

  const getStatusColor = (status) => {
    if (status === 'CONFIRMED') return '#00aa44';
    if (status === 'CANCELLED') return '#cc0000';
    return '#FF8C00';
  };

  const renderListing = ({ item }) => (
    <View style={styles.listingCard}>
      <Image source={{ uri: getPhoto(item) }} style={styles.listingImage} />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listingLocation}>📍 {item.location}</Text>
        <Text style={styles.listingPrice}>${item.pricePerNight}/night</Text>
        <View style={styles.listingActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
            <Text style={styles.editBtnText}>👁️ View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteListing(item)}>
            <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle} numberOfLines={1}>
          {item.listing?.title || 'Listing'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.bookingGuest}>
        👤 Guest: {item.guest?.name || item.user?.name || 'Unknown'}
      </Text>

      <View style={styles.bookingDates}>
        <Text style={styles.bookingDate}>
          📅 {new Date(item.checkIn).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
          })} → {new Date(item.checkOut).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </Text>
        <Text style={styles.bookingPrice}>${item.totalPrice}</Text>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.bookingBtns}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => handleUpdateBookingStatus(item.id, 'CONFIRMED')}>
            <Text style={styles.confirmBtnText}>✅ Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleUpdateBookingStatus(item.id, 'CANCELLED')}>
            <Text style={styles.rejectBtnText}>❌ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#FF385C" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Host Dashboard</Text>
          <Text style={styles.headerSub}>Welcome back, {user?.name?.split(' ')[0]}! 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateListing')}>
          <Text style={styles.addBtnText}>+ List</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsRow}>
          {[
            { label: 'Listings', value: listings.length, icon: '🏠', color: '#FF385C' },
            { label: 'Bookings', value: bookings.length, icon: '📅', color: '#4A90E2' },
            { label: 'Earnings', value: `$${stats.totalEarnings}`, icon: '💰', color: '#00aa44' },
            { label: 'Pending', value: stats.pendingBookings, icon: '⏳', color: '#FF8C00' },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { borderTopColor: stat.color }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
          onPress={() => setActiveTab('listings')}>
          <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>
            🏠 My Listings ({listings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}>
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            📅 Bookings ({bookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'listings' ? (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          renderItem={renderListing}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchData}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySub}>Create your first listing!</Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => navigation.navigate('CreateListing')}>
                <Text style={styles.createBtnText}>+ Create Listing</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchData}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySub}>Bookings will appear here</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#222' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  addBtn: {
    backgroundColor: '#FF385C', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  statsScroll: { maxHeight: 110 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  statCard: {
    width: 90, backgroundColor: '#f9f9f9',
    borderRadius: 12, padding: 12, alignItems: 'center',
    borderTopWidth: 3
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#888' },

  tabs: {
    flexDirection: 'row', borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tab: {
    flex: 1, paddingVertical: 14,
    alignItems: 'center', borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: { borderBottomColor: '#FF385C' },
  tabText: { fontSize: 13, color: '#888', fontWeight: '500' },
  tabTextActive: { color: '#FF385C', fontWeight: '700' },

  listingCard: {
    flexDirection: 'row', marginBottom: 16,
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 6, elevation: 2, overflow: 'hidden'
  },
  listingImage: { width: 100, height: 110 },
  listingInfo: { flex: 1, padding: 12 },
  listingTitle: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 4 },
  listingLocation: { fontSize: 12, color: '#888', marginBottom: 4 },
  listingPrice: { fontSize: 13, fontWeight: '600', color: '#FF385C', marginBottom: 8 },
  listingActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 6, alignItems: 'center'
  },
  editBtnText: { fontSize: 12, color: '#444', fontWeight: '500' },
  deleteBtn: {
    flex: 1, borderWidth: 1, borderColor: '#FF385C',
    borderRadius: 8, padding: 6, alignItems: 'center'
  },
  deleteBtnText: { fontSize: 12, color: '#FF385C', fontWeight: '500' },

  bookingCard: {
    marginBottom: 14, backgroundColor: '#fff',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 6, elevation: 2
  },
  bookingHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8
  },
  bookingTitle: { fontSize: 14, fontWeight: '700', color: '#222', flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bookingGuest: { fontSize: 13, color: '#666', marginBottom: 6 },
  bookingDates: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10
  },
  bookingDate: { fontSize: 12, color: '#888' },
  bookingPrice: { fontSize: 14, fontWeight: '700', color: '#222' },
  bookingBtns: { flexDirection: 'row', gap: 10 },
  confirmBtn: {
    flex: 1, backgroundColor: '#f0fff4',
    borderWidth: 1, borderColor: '#00aa44',
    borderRadius: 10, padding: 10, alignItems: 'center'
  },
  confirmBtnText: { fontSize: 13, fontWeight: '700', color: '#00aa44' },
  rejectBtn: {
    flex: 1, backgroundColor: '#fff0f0',
    borderWidth: 1, borderColor: '#FF385C',
    borderRadius: 10, padding: 10, alignItems: 'center'
  },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#FF385C' },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', marginBottom: 20 },
  createBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12
  },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});