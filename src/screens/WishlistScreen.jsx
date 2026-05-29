import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, SafeAreaView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FALLBACKS = {
  APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  HOUSE: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  VILLA: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  CABIN: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
};

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadWishlist);
    return unsubscribe;
  }, [navigation]);

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('wishlist');
      setWishlist(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.log(err);
    }
  };

  const removeFromWishlist = async (id) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = wishlist.filter(item => item.id !== id);
            setWishlist(updated);
            await AsyncStorage.setItem('wishlist', JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const clearAll = async () => {
    Alert.alert(
      'Clear Wishlist',
      'Remove all saved listings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setWishlist([]);
            await AsyncStorage.setItem('wishlist', JSON.stringify([]));
          }
        }
      ]
    );
  };

  const getPhoto = (item) => {
    if (item.photos && item.photos[0]?.url) return item.photos[0].url;
    return FALLBACKS[item.type] || FALLBACKS.APARTMENT;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
      <Image source={{ uri: getPhoto(item) }} style={styles.image} />
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => removeFromWishlist(item.id)}>
        <Text style={{ fontSize: 22 }}>❤️</Text>
      </TouchableOpacity>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.location} numberOfLines={1}>
            {item.type} in {item.location}
          </Text>
          {item.rating ? (
            <Text style={styles.rating}>⭐ {item.rating}</Text>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.guests}>Up to {item.guests} guests</Text>
        <Text style={styles.price}>
          <Text style={styles.priceBold}>${item.pricePerNight}</Text> / night
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlists</Text>
        {wishlist.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearBtn}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>No saved listings yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart on any listing to save it here
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.exploreBtnText}>Explore listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListHeaderComponent={
            <Text style={styles.count}>{wishlist.length} saved listing{wishlist.length !== 1 ? 's' : ''}</Text>
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
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#222' },
  clearBtn: { fontSize: 14, color: '#FF385C', fontWeight: '600' },
  count: { fontSize: 14, color: '#888', marginBottom: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  exploreBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14
  },
  exploreBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  card: { marginBottom: 28 },
  image: { width: '100%', height: 260, borderRadius: 16 },
  heartBtn: { position: 'absolute', top: 14, right: 14 },
  info: { paddingTop: 10, paddingHorizontal: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  location: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
  rating: { fontSize: 13, fontWeight: '500', color: '#222' },
  title: { fontSize: 14, color: '#666', marginTop: 2 },
  guests: { fontSize: 13, color: '#888', marginTop: 2 },
  price: { fontSize: 14, color: '#222', marginTop: 4 },
  priceBold: { fontWeight: '700', fontSize: 15 },
});