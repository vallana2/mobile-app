import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator
} from 'react-native';
import api from '../api/api';

export default function MapScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get('/listings');
      setListings(res.data.data || res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const locations = {
    'Kigali': { x: 52, y: 45 },
    'Musanze': { x: 30, y: 25 },
    'Nyungwe': { x: 25, y: 65 },
    'Butare': { x: 45, y: 70 },
    'Gisenyi': { x: 20, y: 30 },
    'Ruhengeri': { x: 32, y: 22 },
  };

  const getPosition = (location) => {
    const city = Object.keys(locations).find(k =>
      location?.toLowerCase().includes(k.toLowerCase())
    );
    return city ? locations[city] : { x: 50, y: 50 };
  };

  if (loading) return (
    <View style={styles.centerBox}>
      <ActivityIndicator size="large" color="#FF385C" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.count}>{listings.length} places</Text>
      </View>

      {/* Map Simulation */}
      <View style={styles.mapContainer}>
        <View style={styles.map}>
          {/* Rwanda outline simulation */}
          <Text style={styles.mapLabel}>Rwanda</Text>

          {listings.map((listing, index) => {
            const pos = getPosition(listing.location);
            const isSelected = selected?.id === listing.id;
            return (
              <TouchableOpacity
                key={listing.id}
                style={[
                  styles.pin,
                  { left: `${pos.x}%`, top: `${pos.y}%` },
                  isSelected && styles.pinSelected
                ]}
                onPress={() => setSelected(isSelected ? null : listing)}>
                <Text style={styles.pinText}>${listing.pricePerNight}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Listing Card */}
        {selected ? (
          <TouchableOpacity
            style={styles.selectedCard}
            onPress={() => navigation.navigate('ListingDetail', { id: selected.id })}>
            <View>
              <Text style={styles.selectedTitle}>{selected.title}</Text>
              <Text style={styles.selectedLocation}>📍 {selected.location}</Text>
              <Text style={styles.selectedPrice}>${selected.pricePerNight} / night</Text>
            </View>
            <Text style={styles.selectedArrow}>→</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Listings List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>All Listings</Text>
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.listCard, selected?.id === item.id && styles.listCardSelected]}
              onPress={() => {
                setSelected(item);
                navigation.navigate('ListingDetail', { id: item.id });
              }}>
              <Text style={styles.listCardType}>{item.type}</Text>
              <Text style={styles.listCardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.listCardLocation} numberOfLines={1}>📍 {item.location}</Text>
              <Text style={styles.listCardPrice}>${item.pricePerNight}/night</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  backText: { color: '#FF385C', fontSize: 16 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#222' },
  count: { fontSize: 13, color: '#888' },
  mapContainer: { flex: 1, position: 'relative' },
  map: {
    flex: 1, backgroundColor: '#E8F4F8',
    margin: 16, borderRadius: 16,
    position: 'relative', overflow: 'hidden'
  },
  mapLabel: {
    position: 'absolute', top: '50%', left: '50%',
    fontSize: 18, fontWeight: '700', color: '#aaa',
    opacity: 0.3
  },
  pin: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 20, paddingHorizontal: 8,
    paddingVertical: 4, borderWidth: 2,
    borderColor: '#FF385C',
    shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 4, elevation: 4
  },
  pinSelected: { backgroundColor: '#FF385C' },
  pinText: { fontSize: 12, fontWeight: '700', color: '#FF385C' },
  selectedCard: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 8, elevation: 6
  },
  selectedTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  selectedLocation: { fontSize: 13, color: '#666', marginBottom: 4 },
  selectedPrice: { fontSize: 14, fontWeight: '600', color: '#FF385C' },
  selectedArrow: { fontSize: 20, color: '#FF385C' },
  listContainer: { height: 160, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  listTitle: { paddingHorizontal: 16, paddingTop: 12, fontSize: 15, fontWeight: '700', color: '#222' },
  listCard: {
    width: 160, backgroundColor: '#f8f8f8',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#eee'
  },
  listCardSelected: { borderColor: '#FF385C', backgroundColor: '#fff0f3' },
  listCardType: { fontSize: 10, color: '#FF385C', fontWeight: '600', marginBottom: 4 },
  listCardTitle: { fontSize: 13, fontWeight: '600', color: '#222', marginBottom: 2 },
  listCardLocation: { fontSize: 12, color: '#666', marginBottom: 4 },
  listCardPrice: { fontSize: 13, fontWeight: '700', color: '#ca2947' },
});