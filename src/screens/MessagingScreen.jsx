import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function MessagingScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadConversations);
    return unsubscribe;
  }, [navigation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('conversations');
      setConversations(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.convCard}
      onPress={() => navigation.navigate('Chat', {
        conversationId: item.id,
        otherUserName: item.otherUserName,
        listingTitle: item.listingTitle,
        listingId: item.listingId,
      })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.otherUserName?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.convInfo}>
        <View style={styles.convRow}>
          <Text style={styles.convName}>{item.otherUserName}</Text>
          <Text style={styles.convTime}>{item.lastTime || ''}</Text>
        </View>
        <Text style={styles.convListing} numberOfLines={1}>
          🏠 {item.listingTitle}
        </Text>
        <Text style={[
          styles.convLastMsg,
          item.unread > 0 && styles.convLastMsgUnread
        ]} numberOfLines={1}>
          {item.lastMessage || 'Tap to start chatting'}
        </Text>
      </View>
      {item.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {conversations.length > 0 && (
          <Text style={styles.headerCount}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#FF385C" size="large" style={{ marginTop: 60 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySub}>
            Go to a listing and tap{'\n'}"Message Host" to start chatting
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.exploreBtnText}>Explore listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadConversations}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20, paddingTop: 16,
    paddingBottom: 12, borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#222' },
  headerCount: { fontSize: 13, color: '#aaa', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  exploreBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14
  },
  exploreBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  convCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5'
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FF385C', justifyContent: 'center',
    alignItems: 'center', marginRight: 14
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  convInfo: { flex: 1 },
  convRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  convName: { fontSize: 15, fontWeight: '700', color: '#222' },
  convTime: { fontSize: 12, color: '#aaa' },
  convListing: { fontSize: 12, color: '#FF385C', marginTop: 2, fontWeight: '500' },
  convLastMsg: { fontSize: 13, color: '#888', marginTop: 2 },
  convLastMsgUnread: { color: '#222', fontWeight: '600' },
  badge: {
    backgroundColor: '#FF385C', borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 4
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});