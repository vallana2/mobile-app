import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadNotifications);
    return unsubscribe;
  }, [navigation]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      setNotifications(stored ? JSON.parse(stored) : []);
    } catch (err) {
      setNotifications([]);
    }
  };

  const markAsRead = async (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = async (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAll = async () => {
    setNotifications([]);
    await AsyncStorage.setItem('notifications', JSON.stringify([]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getBgColor = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED': return '#f0fff4';
      case 'BOOKING_CANCELLED': return '#fff0f0';
      case 'NEW_MESSAGE': return '#f0f8ff';
      case 'REVIEW_REQUEST': return '#fffbf0';
      case 'CHECKIN_REMINDER': return '#f8f0ff';
      default: return '#f9f9f9';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notifCard,
        !item.read && styles.notifCardUnread,
        { backgroundColor: item.read ? '#fff' : getBgColor(item.type) }
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.8}>

      <View style={[styles.iconBox, !item.read && styles.iconBoxUnread]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>

      <View style={styles.notifContent}>
        <View style={styles.notifRow}>
          <Text style={[
            styles.notifTitle,
            !item.read && styles.notifTitleUnread
          ]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteNotification(item.id)}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {notifications.length > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {notifications.length > 0 && (
        <TouchableOpacity style={styles.clearAllBtn} onPress={clearAll}>
          <Text style={styles.clearAllText}>🗑️ Clear all</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySub}>
            Book a listing or cancel a booking to see notifications here!
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.exploreBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  headerBadge: {
    backgroundColor: '#FF385C', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2
  },
  headerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  markAllText: {
    fontSize: 13, color: '#FF385C',
    fontWeight: '600', width: 80, textAlign: 'right'
  },
  clearAllBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
    alignItems: 'flex-end'
  },
  clearAllText: { fontSize: 13, color: '#aaa' },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12
  },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: '#FF385C' },
  iconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center'
  },
  iconBoxUnread: { backgroundColor: '#fff0f2' },
  iconText: { fontSize: 22 },
  notifContent: { flex: 1 },
  notifRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4
  },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#666', flex: 1 },
  notifTitleUnread: { color: '#222', fontWeight: '700' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FF385C', marginLeft: 6
  },
  notifMessage: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: '#aaa' },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16, color: '#ccc' },
  separator: { height: 1, backgroundColor: '#f5f5f5' },
  empty: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 40
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22, fontWeight: '700',
    color: '#222', marginBottom: 8
  },
  emptySub: {
    fontSize: 14, color: '#888',
    textAlign: 'center', lineHeight: 22, marginBottom: 24
  },
  exploreBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14
  },
  exploreBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});