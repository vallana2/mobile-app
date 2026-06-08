import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import api from '../api/api';

export default function AvailabilityCalendarScreen({ route, navigation }) {
  const { listingId, listingTitle } = route.params;
  const [blockedDates, setBlockedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/listings/${listingId}/blocked-dates`);
      const dates = res.data.blockedDates || res.data || [];
      const marked = {};
      dates.forEach(date => {
        marked[date] = {
          disabled: true,
          disableTouchEvent: false,
          marked: true,
          dotColor: '#FF385C',
          selectedColor: '#FF385C',
        };
      });
      setBlockedDates(marked);
      setSelectedDates(marked);
    } catch (err) {
      console.log(err);
      setSelectedDates({});
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    const today = new Date().toISOString().split('T')[0];

    if (dateString < today) {
      Alert.alert('Invalid', 'Cannot block past dates');
      return;
    }

    const updated = { ...selectedDates };
    if (updated[dateString]) {
      delete updated[dateString];
    } else {
      updated[dateString] = {
        selected: true,
        selectedColor: '#FF385C',
        marked: true,
        dotColor: '#fff',
      };
    }
    setSelectedDates(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dates = Object.keys(selectedDates);
      await api.post(`/listings/${listingId}/blocked-dates`, { dates });
      Alert.alert('✅ Saved', 'Availability calendar updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All',
      'Remove all blocked dates?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => setSelectedDates({}) }
      ]
    );
  };

  const blockedCount = Object.keys(selectedDates).length;
  const today = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Availability</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {listingTitle}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF385C' }]} />
            <Text style={styles.legendText}>Blocked / Unavailable</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#eee' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tap dates to block or unblock them.
            Blocked dates cannot be booked by guests.
          </Text>
        </View>

        {/* Calendar */}
        {loading ? (
          <ActivityIndicator
            color="#FF385C" size="large"
            style={{ marginTop: 40 }}
          />
        ) : (
          <Calendar
            onDayPress={handleDayPress}
            markedDates={selectedDates}
            minDate={today}
            markingType="simple"
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              selectedDayBackgroundColor: '#FF385C',
              selectedDayTextColor: '#fff',
              todayTextColor: '#FF385C',
              dayTextColor: '#222',
              textDisabledColor: '#d9e1e8',
              dotColor: '#FF385C',
              selectedDotColor: '#fff',
              arrowColor: '#FF385C',
              monthTextColor: '#222',
              textDayFontWeight: '400',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 15,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{blockedCount}</Text>
            <Text style={styles.statLabel}>Blocked Dates</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {blockedCount > 0 ? '❌' : '✅'}
            </Text>
            <Text style={styles.statLabel}>
              {blockedCount > 0 ? 'Has blocked dates' : 'Fully available'}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>
                💾 Save Availability ({blockedCount} dates blocked)
              </Text>
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
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  backBtn: { padding: 4, width: 40 },
  backText: { fontSize: 24, color: '#FF385C' },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  clearText: { fontSize: 14, color: '#FF385C', fontWeight: '600' },

  legend: {
    flexDirection: 'row', gap: 20,
    paddingHorizontal: 20, paddingVertical: 12
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: '#666' },

  infoBox: {
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: '#f0f8ff', borderRadius: 10, padding: 12
  },
  infoText: { fontSize: 13, color: '#444', lineHeight: 20 },

  calendar: {
    marginHorizontal: 10,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  statsRow: {
    flexDirection: 'row', margin: 20,
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 16
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#eee' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#FF385C', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888', textAlign: 'center' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1,
    borderTopColor: '#f0f0f0', padding: 20
  },
  saveBtn: {
    backgroundColor: '#FF385C', borderRadius: 14,
    padding: 16, alignItems: 'center'
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});