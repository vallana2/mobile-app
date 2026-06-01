import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, TextInput,
  ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const REPORT_REASONS = [
  { id: '1', icon: '🚫', label: 'Inappropriate content' },
  { id: '2', icon: '💰', label: 'Scam or fraud' },
  { id: '3', icon: '🏠', label: 'Listing is inaccurate' },
  { id: '4', icon: '😤', label: 'Rude or hostile behavior' },
  { id: '5', icon: '🔒', label: 'Privacy violation' },
  { id: '6', icon: '⚠️', label: 'Safety concern' },
  { id: '7', icon: '🐛', label: 'Other issue' },
];

const EMERGENCY_CONTACTS = [
  { id: '1', name: 'Rwanda Police', number: '112', icon: '👮' },
  { id: '2', name: 'Ambulance', number: '912', icon: '🚑' },
  { id: '3', name: 'Fire Brigade', number: '111', icon: '🚒' },
  { id: '4', name: 'Airbnb Support', number: '+1-844-234-2500', icon: '🏠' },
];

export default function SafetyScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('report');
  const [selectedReason, setSelectedReason] = useState(null);
  const [reportType, setReportType] = useState('listing');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert('Required', 'Please select a reason for your report.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Required', 'Please provide more details (at least 10 characters).');
      return;
    }

    Alert.alert(
      'Submit Report',
      'Are you sure you want to submit this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setLoading(true);
              // In real app this would call an API endpoint
              // await api.post('/reports', { reason: selectedReason, description, type: reportType });

              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1500));

              Alert.alert(
                '✅ Report Submitted',
                'Thank you for your report. Our team will review it within 24 hours.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to submit report. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'report' && styles.tabActive]}
          onPress={() => setActiveTab('report')}>
          <Text style={[styles.tabText, activeTab === 'report' && styles.tabTextActive]}>
            🚨 Report Issue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'emergency' && styles.tabActive]}
          onPress={() => setActiveTab('emergency')}>
          <Text style={[styles.tabText, activeTab === 'emergency' && styles.tabTextActive]}>
            🆘 Emergency
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tips' && styles.tabActive]}
          onPress={() => setActiveTab('tips')}>
          <Text style={[styles.tabText, activeTab === 'tips' && styles.tabTextActive]}>
            🛡️ Safety Tips
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Report Tab */}
        {activeTab === 'report' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are you reporting?</Text>

            {/* Report Type */}
            <View style={styles.reportTypeRow}>
              {['listing', 'user', 'booking'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, reportType === type && styles.typeBtnActive]}
                  onPress={() => setReportType(type)}>
                  <Text style={[styles.typeBtnText, reportType === type && styles.typeBtnTextActive]}>
                    {type === 'listing' ? '🏠 Listing' : type === 'user' ? '👤 User' : '📅 Booking'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reason Selection */}
            <Text style={styles.label}>Select a reason:</Text>
            {REPORT_REASONS.map(reason => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonBtn,
                  selectedReason === reason.id && styles.reasonBtnActive
                ]}
                onPress={() => setSelectedReason(reason.id)}>
                <Text style={styles.reasonIcon}>{reason.icon}</Text>
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason.id && styles.reasonTextActive
                ]}>
                  {reason.label}
                </Text>
                {selectedReason === reason.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Description */}
            <Text style={[styles.label, { marginTop: 16 }]}>Describe the issue:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Please provide details about the issue..."
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={t => t.length <= 500 && setDescription(t)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmitReport}
              disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>🚨 Submit Report</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Emergency Tab */}
        {activeTab === 'emergency' && (
          <View style={styles.section}>
            <View style={styles.emergencyBanner}>
              <Text style={styles.emergencyIcon}>🆘</Text>
              <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
              <Text style={styles.emergencySubtitle}>
                If you are in immediate danger, call emergency services immediately.
              </Text>
            </View>

            {EMERGENCY_CONTACTS.map(contact => (
              <View key={contact.id} style={styles.contactCard}>
                <Text style={styles.contactIcon}>{contact.icon}</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Alert.alert(
                    `Call ${contact.name}`,
                    `Dial ${contact.number}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Call', onPress: () => {} }
                    ]
                  )}>
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.safetyNote}>
              <Text style={styles.safetyNoteText}>
                💡 Always meet your host/guest in a safe, public location first.
                Never share personal financial information with strangers.
              </Text>
            </View>
          </View>
        )}

        {/* Safety Tips Tab */}
        {activeTab === 'tips' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Guidelines</Text>

            {[
              {
                icon: '🔐',
                title: 'Protect your account',
                tips: [
                  'Use a strong, unique password',
                  'Enable two-factor authentication',
                  'Never share your login credentials',
                ]
              },
              {
                icon: '🏠',
                title: 'Before you book',
                tips: [
                  'Read all reviews carefully',
                  'Verify the listing photos are accurate',
                  'Communicate through the app only',
                  'Never pay outside the platform',
                ]
              },
              {
                icon: '✈️',
                title: 'During your stay',
                tips: [
                  'Share your itinerary with someone you trust',
                  'Keep emergency contacts handy',
                  'Know your check-out time',
                  'Report any issues immediately',
                ]
              },
              {
                icon: '👤',
                title: 'For hosts',
                tips: [
                  'Verify guest profiles before accepting',
                  'Keep your listing information accurate',
                  'Respond to messages promptly',
                  'Report suspicious activity immediately',
                ]
              },
            ].map((section, i) => (
              <View key={i} style={styles.tipSection}>
                <View style={styles.tipHeader}>
                  <Text style={styles.tipIcon}>{section.icon}</Text>
                  <Text style={styles.tipTitle}>{section.title}</Text>
                </View>
                {section.tips.map((tip, j) => (
                  <View key={j} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  tab: {
    flex: 1, paddingVertical: 12,
    alignItems: 'center', borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: { borderBottomColor: '#FF385C' },
  tabText: { fontSize: 12, color: '#888', fontWeight: '500' },
  tabTextActive: { color: '#FF385C', fontWeight: '700' },

  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 10 },

  reportTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeBtn: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 10, alignItems: 'center'
  },
  typeBtnActive: { borderColor: '#FF385C', backgroundColor: '#fff0f3' },
  typeBtnText: { fontSize: 12, color: '#666', fontWeight: '500' },
  typeBtnTextActive: { color: '#FF385C', fontWeight: '700' },

  reasonBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: '#eee', marginBottom: 8, backgroundColor: '#fafafa'
  },
  reasonBtnActive: { borderColor: '#FF385C', backgroundColor: '#fff0f3' },
  reasonIcon: { fontSize: 20, marginRight: 12 },
  reasonText: { flex: 1, fontSize: 14, color: '#444' },
  reasonTextActive: { color: '#FF385C', fontWeight: '600' },
  checkmark: { fontSize: 16, color: '#FF385C', fontWeight: '700' },

  textArea: {
    borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 12, padding: 14,
    fontSize: 15, color: '#222', minHeight: 120,
    backgroundColor: '#fafafa'
  },
  charCount: { fontSize: 12, color: '#aaa', textAlign: 'right', marginTop: 4, marginBottom: 16 },

  submitBtn: {
    backgroundColor: '#FF385C', borderRadius: 12,
    padding: 16, alignItems: 'center'
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  emergencyBanner: {
    backgroundColor: '#fff0f0', borderRadius: 16,
    padding: 20, alignItems: 'center', marginBottom: 20
  },
  emergencyIcon: { fontSize: 48, marginBottom: 8 },
  emergencyTitle: { fontSize: 20, fontWeight: '700', color: '#cc0000', marginBottom: 8 },
  emergencySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },

  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, borderWidth: 1,
    borderColor: '#f0f0f0', marginBottom: 12,
    backgroundColor: '#fafafa'
  },
  contactIcon: { fontSize: 32, marginRight: 14 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '700', color: '#222' },
  contactNumber: { fontSize: 16, color: '#FF385C', fontWeight: '600', marginTop: 2 },
  callBtn: {
    backgroundColor: '#FF385C', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8
  },
  callBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  safetyNote: {
    backgroundColor: '#f0f8ff', borderRadius: 12,
    padding: 14, marginTop: 8
  },
  safetyNoteText: { fontSize: 13, color: '#444', lineHeight: 20 },

  tipSection: {
    marginBottom: 20, backgroundColor: '#f9f9f9',
    borderRadius: 14, padding: 16
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tipIcon: { fontSize: 24, marginRight: 10 },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  tipBullet: { fontSize: 16, color: '#FF385C', marginRight: 8, marginTop: 1 },
  tipText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
});