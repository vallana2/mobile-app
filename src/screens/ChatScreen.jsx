import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUserName, listingTitle } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(`chat_${conversationId}`);
      setMessages(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: text.trim(),
      senderId: user?.id,
      senderName: user?.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setText('');
    await AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(updated));

    // Update conversation last message
    const stored = await AsyncStorage.getItem('conversations');
    const convs = stored ? JSON.parse(stored) : [];
    const updatedConvs = convs.map(c =>
      c.id === conversationId
        ? { ...c, lastMessage: newMsg.text, lastTime: newMsg.time, unread: 0 }
        : c
    );
    await AsyncStorage.setItem('conversations', JSON.stringify(updatedConvs));

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.msgRow, item.isMine ? styles.msgRowMine : styles.msgRowOther]}>
      {!item.isMine && (
        <View style={styles.msgAvatar}>
          <Text style={styles.msgAvatarText}>
            {otherUserName?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>
          {item.text}
        </Text>
        <Text style={[styles.bubbleTime, item.isMine && styles.bubbleTimeMine]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <Text style={styles.headerListing} numberOfLines={1}>{listingTitle}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>No messages yet</Text>
            <Text style={styles.emptyChatSub}>Say hello! 👋</Text>
          </View>
        }
        renderMessage={renderMessage}
        renderItem={renderMessage}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
            multiline
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim()}>
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { fontSize: 24, color: '#FF385C' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#222' },
  headerListing: { fontSize: 12, color: '#FF385C', marginTop: 1 },
  messagesList: { padding: 16, paddingBottom: 8 },
  emptyChat: { alignItems: 'center', marginTop: 60 },
  emptyChatText: { fontSize: 16, color: '#888', marginBottom: 4 },
  emptyChatSub: { fontSize: 14, color: '#aaa' },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FF385C', justifyContent: 'center',
    alignItems: 'center', marginRight: 8
  },
  msgAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bubble: {
    maxWidth: '75%', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10
  },
  bubbleMine: { backgroundColor: '#FF385C', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: '#222' },
  bubbleTextMine: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    backgroundColor: '#fff', gap: 10
  },
  input: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#222', maxHeight: 100
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FF385C', justifyContent: 'center', alignItems: 'center'
  },
  sendBtnDisabled: { backgroundColor: '#ffb3be' },
  sendBtnText: { color: '#fff', fontSize: 18 },
});