import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, FlatList, Image, SafeAreaView,
  ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform
} from 'react-native';
import api from '../api/api';

const PROPERTY_TYPES = ['All', 'APARTMENT', 'HOUSE', 'VILLA', 'CABIN'];

const AMENITIES = [
  { key: 'wifi', label: 'WiFi', icon: '📶' },
  { key: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { key: 'parking', label: 'Parking', icon: '🚗' },
  { key: 'pool', label: 'Pool', icon: '🏊' },
  { key: 'gym', label: 'Gym', icon: '🏋️' },
  { key: 'ac', label: 'AC', icon: '❄️' },
  { key: 'tv', label: 'TV', icon: '📺' },
  { key: 'pets', label: 'Pets OK', icon: '🐾' },
];

const FALLBACKS = {
  APARTMENT: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  HOUSE: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  VILLA: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  CABIN: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
};

export default function SearchScreen({ navigation }) {
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const toggleAmenity = (key) => {
    setSelectedAmenities(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    );
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      setSearched(true);

      const params = {};
      if (location.trim()) params.location = location.trim();
      if (guests) params.guests = guests;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (propertyType !== 'All') params.type = propertyType;
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');

      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/listings/search?${query}`);
      const data = res.data.listings || res.data.data || res.data || [];
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setLocation('');
    setGuests('');
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('All');
    setSelectedAmenities([]);
    setResults([]);
    setSearched(false);
    setError('');
  };

  const getPhoto = (item) => {
    if (item.photos && item.photos[0]?.url) return item.photos[0].url;
    return FALLBACKS[item.type] || FALLBACKS.APARTMENT;
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
      <Image source={{ uri: getPhoto(item) }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLocation} numberOfLines={1}>
            {item.type} in {item.location}
          </Text>
          {item.rating ? (
            <Text style={styles.cardRating}>★ {item.rating}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <FlatList
          data={results}
          keyExtractor={(item, i) => item.id?.toString() || i.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <View>
              {/* Search Box */}
              <View style={styles.searchSection}>
                <View style={styles.searchBox}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Where are you going?"
                    placeholderTextColor="#aaa"
                    value={location}
                    onChangeText={setLocation}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                  />
                  {location.length > 0 && (
                    <TouchableOpacity onPress={() => setLocation('')}>
                      <Text style={{ fontSize: 18, color: '#aaa' }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Guests */}
                <View style={styles.row}>
                  <View style={[styles.inputBox, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>👥 Guests</Text>
                    <TextInput
                      style={styles.smallInput}
                      placeholder="How many?"
                      placeholderTextColor="#aaa"
                      value={guests}
                      onChangeText={setGuests}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.filterToggle}
                    onPress={() => setShowFilters(!showFilters)}>
                    <Text style={styles.filterToggleText}>
                      {showFilters ? '✕ Filters' : '⚙️ Filters'}
                    </Text>
                    {(selectedAmenities.length > 0 || minPrice || maxPrice || propertyType !== 'All') && (
                      <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>
                          {selectedAmenities.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (propertyType !== 'All' ? 1 : 0)}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Filters Panel */}
                {showFilters && (
                  <View style={styles.filtersPanel}>
                    {/* Price Range */}
                    <Text style={styles.filterTitle}>💵 Price Range (per night)</Text>
                    <View style={styles.row}>
                      <View style={[styles.inputBox, { flex: 1 }]}>
                        <TextInput
                          style={styles.smallInput}
                          placeholder="Min $"
                          placeholderTextColor="#aaa"
                          value={minPrice}
                          onChangeText={setMinPrice}
                          keyboardType="numeric"
                        />
                      </View>
                      <Text style={{ color: '#888', alignSelf: 'center' }}>—</Text>
                      <View style={[styles.inputBox, { flex: 1 }]}>
                        <TextInput
                          style={styles.smallInput}
                          placeholder="Max $"
                          placeholderTextColor="#aaa"
                          value={maxPrice}
                          onChangeText={setMaxPrice}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {/* Property Type */}
                    <Text style={styles.filterTitle}>🏠 Property Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.typeRow}>
                        {PROPERTY_TYPES.map(type => (
                          <TouchableOpacity
                            key={type}
                            style={[styles.typeBtn, propertyType === type && styles.typeBtnActive]}
                            onPress={() => setPropertyType(type)}>
                            <Text style={[styles.typeBtnText, propertyType === type && styles.typeBtnTextActive]}>
                              {type === 'All' ? '🏠 All' :
                               type === 'APARTMENT' ? '🏢 Apartment' :
                               type === 'HOUSE' ? '🏡 House' :
                               type === 'VILLA' ? '🏰 Villa' : '🌲 Cabin'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>

                    {/* Amenities */}
                    <Text style={styles.filterTitle}>✨ Amenities</Text>
                    <View style={styles.amenitiesGrid}>
                      {AMENITIES.map(amenity => (
                        <TouchableOpacity
                          key={amenity.key}
                          style={[
                            styles.amenityBtn,
                            selectedAmenities.includes(amenity.key) && styles.amenityBtnActive
                          ]}
                          onPress={() => toggleAmenity(amenity.key)}>
                          <Text style={styles.amenityIcon}>{amenity.icon}</Text>
                          <Text style={[
                            styles.amenityLabel,
                            selectedAmenities.includes(amenity.key) && styles.amenityLabelActive
                          ]}>
                            {amenity.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Search Button */}
                <TouchableOpacity
                  style={[styles.searchBtn, loading && { opacity: 0.7 }]}
                  onPress={handleSearch}
                  disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.searchBtnText}>🔍 Search Listings</Text>
                  }
                </TouchableOpacity>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {searched && !loading && (
                  <Text style={styles.resultsCount}>
                    {results.length} listing{results.length !== 1 ? 's' : ''} found
                  </Text>
                )}
              </View>
            </View>
          }
          renderItem={renderResult}
          ListEmptyComponent={
            searched && !loading ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🏠</Text>
                <Text style={styles.emptyTitle}>No listings found</Text>
                <Text style={styles.emptySub}>Try different filters or location</Text>
              </View>
            ) : !searched ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
                <Text style={styles.emptyTitle}>Find your perfect stay</Text>
                <Text style={styles.emptySub}>Search by location, price, type and more</Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
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
  clearText: { fontSize: 14, color: '#FF385C', fontWeight: '600' },

  searchSection: { padding: 16, gap: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    gap: 10, borderWidth: 1, borderColor: '#eee'
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 15, color: '#222' },

  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  inputBox: {
    backgroundColor: '#f5f5f5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#eee'
  },
  inputLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  smallInput: { fontSize: 14, color: '#222' },

  filterToggle: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#eee', gap: 6
  },
  filterToggleText: { fontSize: 14, fontWeight: '600', color: '#444' },
  filterBadge: {
    backgroundColor: '#FF385C', borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
  },
  filterBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  filtersPanel: {
    backgroundColor: '#f9f9f9', borderRadius: 14,
    padding: 16, gap: 12,
    borderWidth: 1, borderColor: '#eee'
  },
  filterTitle: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 8 },

  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  typeBtnActive: { backgroundColor: '#222', borderColor: '#222' },
  typeBtnText: { fontSize: 13, color: '#444', fontWeight: '500' },
  typeBtnTextActive: { color: '#fff' },

  amenitiesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8
  },
  amenityBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  amenityBtnActive: { backgroundColor: '#FF385C', borderColor: '#FF385C' },
  amenityIcon: { fontSize: 14 },
  amenityLabel: { fontSize: 13, color: '#444' },
  amenityLabelActive: { color: '#fff' },

  searchBtn: {
    backgroundColor: '#FF385C', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 4
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  errorText: { color: '#cc0000', textAlign: 'center', fontSize: 14 },
  resultsCount: { fontSize: 14, color: '#888', textAlign: 'center' },

  card: { marginHorizontal: 16, marginBottom: 24 },
  cardImage: { width: '100%', height: 240, borderRadius: 16 },
  cardInfo: { paddingTop: 10, paddingHorizontal: 4 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLocation: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
  cardRating: { fontSize: 13, fontWeight: '500', color: '#222' },
  cardTitle: { fontSize: 14, color: '#666', marginTop: 2 },
  cardGuests: { fontSize: 13, color: '#888', marginTop: 2 },
  cardPrice: { fontSize: 14, color: '#222', marginTop: 4 },
  cardPriceBold: { fontWeight: '700', fontSize: 15 },

  empty: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center' },
});