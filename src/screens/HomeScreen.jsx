import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { name: 'All', icon: '🏠', label: 'All' },
  { name: 'APARTMENT', icon: '🏢', label: 'Apartments' },
  { name: 'HOUSE', icon: '🏡', label: 'Houses' },
  { name: 'VILLA', icon: '🏰', label: 'Villas' },
  { name: 'CABIN', icon: '🌲', label: 'Cabins' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    fetchListings();
    loadWishlist();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get('/listings');
      const data = res.data.data || res.data;
      const stored = await AsyncStorage.getItem('photoUrls');
      const photoUrls = stored ? JSON.parse(stored) : {};
      const listingsWithPhotos = data.map(listing => ({
        ...listing,
        localPhotoUrl: photoUrls[listing.id] || null
      }));
      setListings(listingsWithPhotos);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    const stored = await AsyncStorage.getItem('wishlist');
    const wishlist = stored ? JSON.parse(stored) : [];
    setWishlistIds(wishlist.map(w => w.id));
  };

  const toggleWishlist = async (item) => {
    const stored = await AsyncStorage.getItem('wishlist');
    const current = stored ? JSON.parse(stored) : [];
    const exists = current.find(w => w.id === item.id);
    let updated;
    if (exists) {
      updated = current.filter(w => w.id !== item.id);
    } else {
      updated = [...current, item];
    }
    await AsyncStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlistIds(updated.map(w => w.id));
  };

  const getPhoto = (item) => {
    if (item.photos && item.photos[0] && item.photos[0].url) return item.photos[0].url;
    if (item.localPhotoUrl) return item.localPhotoUrl;
    const fallbacks = {
      APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      HOUSE: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      VILLA: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      CABIN: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
    };
    return fallbacks[item.type] || fallbacks.APARTMENT;
  };

  const filtered = category === 'All'
    ? listings
    : listings.filter(l => l.type === category);

  const renderItem = ({ item }) => {
    const photo = getPhoto(item);
    const isWishlisted = wishlistIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListingDetail', {
          id: item.id,
          localPhotoUrl: item.localPhotoUrl
        })}
        activeOpacity={0.95}>

        <Image source={{ uri: photo }} style={styles.cardImage} />

        {/* Heart / Wishlist */}
        <TouchableOpacity
          style={styles.wishlist}
          onPress={() => toggleWishlist(item)}>
          <Text style={styles.wishlistIcon}>
            {isWishlisted ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>

        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Guest favorite</Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLocation} numberOfLines={1}>
              {item.type} in {item.location}
            </Text>
            {item.rating ? (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStar}>⭐</Text>
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardGuests}>Up to {item.guests} guests</Text>
          <Text style={styles.cardPrice}>
            <Text style={styles.cardPriceBold}>${item.pricePerNight}</Text> / night
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>airbnb</Text>

        {/* Search Bar — tappable → opens SearchScreen */}
        <TouchableOpacity
          style={styles.searchBarTop}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}>
          <Text style={styles.searchBarText}>🔍  Where · Anytime · Add guests</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {user && user.role === 'HOST' ? (
            <TouchableOpacity
              style={styles.hostBtn}
              onPress={() => navigation.navigate('CreateListing')}>
              <Text style={styles.hostBtnText}>+ List</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>
              {user ? user.name.charAt(0).toUpperCase() : '👤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.name}
            style={styles.catItem}
            onPress={() => setCategory(cat.name)}>
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[
              styles.catLabel,
              category === cat.name && styles.catLabelActive
            ]}>
              {cat.label}
            </Text>
            {category === cat.name
              ? <View style={styles.catUnderline} />
              : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listings */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#FF385C" />
          <Text style={styles.loadingText}>Finding places...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🏠</Text>
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptySubtitle}>
            {user && user.role === 'HOST'
              ? 'Create your first listing!'
              : 'Check back later for available places'}
          </Text>
          {user && user.role === 'HOST' ? (
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('CreateListing')}>
              <Text style={styles.emptyBtnText}>+ Create Listing</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchListings}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 8
  },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#FF385C' },
  searchBarTop: {
    flex: 1, backgroundColor: '#f7f7f7',
    borderRadius: 24, paddingHorizontal: 12,
    paddingVertical: 8, borderWidth: 1, borderColor: '#eee'
  },
  searchBarText: { fontSize: 12, color: '#444', fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hostBtn: {
    borderWidth: 1, borderColor: '#FF385C',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5
  },
  hostBtnText: { color: '#FF385C', fontSize: 11, fontWeight: '600' },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FF385C', justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  categories: {
    maxHeight: 72, borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  catItem: { alignItems: 'center', paddingBottom: 8, paddingTop: 4 },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catLabel: { fontSize: 12, color: '#888', fontWeight: '500' },
  catLabelActive: { color: '#222', fontWeight: '700' },
  catUnderline: {
    height: 2, width: '100%',
    backgroundColor: '#222', marginTop: 4, borderRadius: 2
  },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { color: '#aaa', marginTop: 12, fontSize: 15 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  emptyBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    padding: 14, paddingHorizontal: 24
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  card: { marginBottom: 32 },
  cardImage: { width: '100%', height: 300, borderRadius: 16 },
  wishlist: { position: 'absolute', top: 16, right: 16 },
  wishlistIcon: { fontSize: 24 },
  badge: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 2
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#222' },
  cardInfo: { paddingTop: 12, paddingHorizontal: 4 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center'
  },
  cardLocation: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingStar: { fontSize: 13 },
  ratingText: { fontSize: 13, fontWeight: '500', color: '#222' },
  cardTitle: { fontSize: 14, color: '#666', marginTop: 2 },
  cardGuests: { fontSize: 13, color: '#888', marginTop: 2 },
  cardPrice: { fontSize: 14, color: '#222', marginTop: 4 },
  cardPriceBold: { fontWeight: '700', fontSize: 15 },
});