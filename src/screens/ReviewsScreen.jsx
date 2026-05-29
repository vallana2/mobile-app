import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  Alert, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const SUB_RATINGS = [
  { key: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { key: 'accuracy', label: 'Accuracy', icon: '✅' },
  { key: 'checkin', label: 'Check-in', icon: '🔑' },
  { key: 'communication', label: 'Communication', icon: '💬' },
  { key: 'location', label: 'Location', icon: '📍' },
  { key: 'value', label: 'Value', icon: '💰' },
];

function Stars({ value, onChange, size = 28, readonly = false }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onChange?.(star)}
          disabled={readonly}>
          <Text style={{ fontSize: size, color: star <= value ? '#FF385C' : '#ddd' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ReviewCard({ item }) {
  const initials = (item.user?.name || item.author?.name || 'G').charAt(0).toUpperCase();
  const name = item.user?.name || item.author?.name || 'Guest';
  const date = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  });
  const hasSubRatings = item.cleanliness || item.accuracy;

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName}>{name}</Text>
          <Text style={styles.reviewDate}>{date}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingBadgeText}>★ {item.rating}</Text>
        </View>
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      {hasSubRatings && (
        <View style={styles.subGrid}>
          {SUB_RATINGS.map(cat => item[cat.key] ? (
            <View key={cat.key} style={styles.subItem}>
              <Text style={styles.subIcon}>{cat.icon}</Text>
              <Text style={styles.subLabel}>{cat.label}</Text>
              <Stars value={item[cat.key]} readonly size={12} />
            </View>
          ) : null)}
        </View>
      )}
    </View>
  );
}

export default function ReviewsScreen({ route, navigation }) {
  const { listingId } = route.params;
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [subRatings, setSubRatings] = useState({
    cleanliness: 0, accuracy: 0, checkin: 0,
    communication: 0, location: 0, value: 0,
  });

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/listings/${listingId}/reviews`);
      const data = res.data.reviews || res.data.data || res.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(2)
    : null;

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select an overall star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert('Too short', 'Please write at least 10 characters.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/listings/${listingId}/reviews`, {
        rating,
        comment: comment.trim(),
        ...subRatings,
      });
      Alert.alert('✅ Success!', 'Your review has been submitted.');
      setShowForm(false);
      setComment('');
      setRating(0);
      setSubRatings({ cleanliness: 0, accuracy: 0, checkin: 0, communication: 0, location: 0, value: 0 });
      fetchReviews();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View>
      {/* Overall Score */}
      {reviews.length > 0 && (
        <View style={styles.scoreBox}>
          <Text style={styles.scoreNum}>{avgRating}</Text>
          <Text style={styles.scoreStar}>★</Text>
          <Text style={styles.scoreCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
        </View>
      )}

      {/* Write Review Button */}
      {user && user.role === 'GUEST' && (
        <TouchableOpacity
          style={[styles.writeBtn, showForm && styles.writeBtnCancel]}
          onPress={() => setShowForm(!showForm)}>
          <Text style={[styles.writeBtnText, showForm && { color: '#888' }]}>
            {showForm ? '✕ Cancel' : '✏️ Write a Review'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Review Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Your Review</Text>

          {/* Overall */}
          <Text style={styles.formLabel}>Overall Rating *</Text>
          <Stars value={rating} onChange={setRating} size={40} />

          {/* Sub Ratings */}
          <Text style={[styles.formLabel, { marginTop: 20 }]}>Rate the Details</Text>
          {SUB_RATINGS.map(cat => (
            <View key={cat.key} style={styles.subRatingRow}>
              <Text style={styles.subRatingLabel}>{cat.icon} {cat.label}</Text>
              <Stars
                value={subRatings[cat.key]}
                onChange={(val) => setSubRatings(p => ({ ...p, [cat.key]: val }))}
                size={22}
              />
            </View>
          ))}

          {/* Comment */}
          <Text style={[styles.formLabel, { marginTop: 20 }]}>Your Experience *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share details about your stay... (min 10 characters)"
            placeholderTextColor="#aaa"
            value={comment}
            onChangeText={t => t.length <= 1000 && setComment(t)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/1000</Text>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Submit Review</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {reviews.length > 0 && (
        <Text style={styles.allReviewsTitle}>
          All Reviews ({reviews.length})
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF385C" style={{ marginTop: 60 }} />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            data={reviews}
            keyExtractor={(item, i) => item.id?.toString() || i.toString()}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <ReviewCard item={item} />}
            ListEmptyComponent={
              !showForm ? (
                <View style={styles.empty}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>⭐</Text>
                  <Text style={styles.emptyTitle}>No reviews yet</Text>
                  <Text style={styles.emptySub}>Be the first to review!</Text>
                </View>
              ) : null
            }
          />
        </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#222' },

  scoreBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff8f8', borderRadius: 16,
    padding: 16, marginBottom: 16, gap: 8
  },
  scoreNum: { fontSize: 48, fontWeight: '700', color: '#222' },
  scoreStar: { fontSize: 28, color: '#FF385C', marginTop: 4 },
  scoreCount: { fontSize: 14, color: '#888', marginTop: 8 },

  writeBtn: {
    borderWidth: 1.5, borderColor: '#FF385C',
    borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 16
  },
  writeBtnCancel: { borderColor: '#ddd' },
  writeBtnText: { color: '#FF385C', fontWeight: '600', fontSize: 15 },

  form: {
    backgroundColor: '#f9f9f9', borderRadius: 16,
    padding: 16, marginBottom: 20
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 10 },

  subRatingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#efefef'
  },
  subRatingLabel: { fontSize: 14, color: '#444' },

  textArea: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
    padding: 12, fontSize: 15, color: '#222',
    minHeight: 120
  },
  charCount: { fontSize: 12, color: '#aaa', textAlign: 'right', marginTop: 4, marginBottom: 12 },

  submitBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 4
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  allReviewsTitle: {
    fontSize: 18, fontWeight: '700',
    color: '#222', marginBottom: 16, marginTop: 4
  },

  reviewCard: {
    marginBottom: 20, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FF385C', justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  reviewName: { fontSize: 15, fontWeight: '700', color: '#222' },
  reviewDate: { fontSize: 12, color: '#aaa', marginTop: 2 },
  ratingBadge: {
    backgroundColor: '#fff8f8', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4
  },
  ratingBadgeText: { fontSize: 14, fontWeight: '700', color: '#FF385C' },
  reviewComment: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 10 },

  subGrid: {
    backgroundColor: '#f9f9f9', borderRadius: 10,
    padding: 10, gap: 6
  },
  subItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subIcon: { fontSize: 13 },
  subLabel: { fontSize: 12, color: '#666', width: 100 },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888' },
});