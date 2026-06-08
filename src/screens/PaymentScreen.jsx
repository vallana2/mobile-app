import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator,
  Alert, TextInput, Image
} from 'react-native';
import { saveNotification } from '../utils/notifications';
import api from '../api/api';

const PAYMENT_METHODS = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    icon: '📱',
    color: '#FFC300',
    bg: '#FFFDE7',
    placeholder: 'Enter MTN number (e.g. 0788123456)',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    icon: '📲',
    color: '#FF0000',
    bg: '#FFF0F0',
    placeholder: 'Enter Airtel number (e.g. 0738123456)',
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    icon: '💳',
    color: '#1A1A2E',
    bg: '#F0F0FF',
    placeholder: 'Enter card number',
  },
  {
    id: 'cash',
    name: 'Pay on Arrival',
    icon: '💵',
    color: '#00AA44',
    bg: '#F0FFF4',
    placeholder: null,
  },
];

export default function PaymentScreen({ route, navigation }) {
  const { listing, checkIn, checkOut, total, bookingData } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=select, 2=details, 3=processing, 4=success

  const formatCard = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : cleaned;
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const validatePayment = () => {
    if (!selectedMethod) {
      Alert.alert('Required', 'Please select a payment method');
      return false;
    }
    if (selectedMethod === 'mtn' || selectedMethod === 'airtel') {
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert('Required', 'Please enter a valid phone number');
        return false;
      }
    }
    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Required', 'Please enter a valid card number');
        return false;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        Alert.alert('Required', 'Please enter card expiry date');
        return false;
      }
      if (!cardCVV || cardCVV.length < 3) {
        Alert.alert('Required', 'Please enter CVV');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    Alert.alert(
      'Confirm Payment',
      `Pay $${total} via ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            try {
              setLoading(true);
              setStep(3);

              // Simulate payment processing
              await new Promise(resolve => setTimeout(resolve, 2000));

              // Create booking in database
              await api.post('/bookings', {
                listingId: listing.id,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
              });

              // Save notification
              await saveNotification({
                type: 'BOOKING_CONFIRMED',
                title: 'Booking Confirmed! 🎉',
                message: `Payment of $${total} successful! Your booking at ${listing.title} is confirmed!`,
                icon: '✅',
              });

              setStep(4);
            } catch (err) {
              setStep(2);
              Alert.alert('Payment Failed', err.response?.data?.message || 'Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Success Screen
  if (step === 4) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successScreen}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successAmount}>${total}</Text>
          <Text style={styles.successSub}>
            Your booking at {listing.title} is confirmed!
          </Text>

          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Listing</Text>
              <Text style={styles.successValue} numberOfLines={1}>{listing.title}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Check-in</Text>
              <Text style={styles.successValue}>{checkIn}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Check-out</Text>
              <Text style={styles.successValue}>{checkOut}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Total Paid</Text>
              <Text style={[styles.successValue, { color: '#FF385C' }]}>${total}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Payment</Text>
              <Text style={styles.successValue}>
                {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Trips' })}>
            <Text style={styles.successBtnText}>View My Trips</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.successBtnOutline}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
            <Text style={styles.successBtnOutlineText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Processing Screen
  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingScreen}>
          <ActivityIndicator size="large" color="#FF385C" />
          <Text style={styles.processingTitle}>Processing Payment...</Text>
          <Text style={styles.processingAmount}>${total}</Text>
          <Text style={styles.processingSub}>
            Please wait while we process your payment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>${total}</Text>
          <Text style={styles.amountListing} numberOfLines={1}>
            🏠 {listing.title}
          </Text>
          <Text style={styles.amountDates}>
            📅 {checkIn} → {checkOut}
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive,
                { borderColor: selectedMethod === method.id ? method.color : '#eee' }
              ]}
              onPress={() => {
                setSelectedMethod(method.id);
                setStep(2);
              }}>
              <View style={[styles.methodIcon, { backgroundColor: method.bg }]}>
                <Text style={{ fontSize: 28 }}>{method.icon}</Text>
              </View>
              <Text style={[
                styles.methodName,
                selectedMethod === method.id && { color: method.color }
              ]}>
                {method.name}
              </Text>
              <View style={[
                styles.radioBtn,
                selectedMethod === method.id && {
                  borderColor: method.color,
                  backgroundColor: method.color
                }
              ]}>
                {selectedMethod === method.id && (
                  <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Details */}
        {selectedMethod && selectedMethod !== 'cash' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>

            {(selectedMethod === 'mtn' || selectedMethod === 'airtel') && (
              <View>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder={selectedMethodData?.placeholder}
                  placeholderTextColor="#aaa"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
                <View style={[
                  styles.mobileMoneyBox,
                  { backgroundColor: selectedMethodData?.bg }
                ]}>
                  <Text style={styles.mobileMoneyText}>
                    📨 You will receive a payment prompt on your phone.
                    Enter your PIN to confirm payment of ${total}.
                  </Text>
                </View>
              </View>
            )}

            {selectedMethod === 'card' && (
              <View>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#aaa"
                  value={cardNumber}
                  onChangeText={t => setCardNumber(formatCard(t))}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor="#aaa"
                      value={cardExpiry}
                      onChangeText={t => setCardExpiry(formatExpiry(t))}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="#aaa"
                      value={cardCVV}
                      onChangeText={setCardCVV}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {selectedMethod === 'cash' && (
          <View style={styles.cashBox}>
            <Text style={styles.cashIcon}>💵</Text>
            <Text style={styles.cashTitle}>Pay on Arrival</Text>
            <Text style={styles.cashText}>
              You will pay ${total} in cash when you arrive at the property.
              The host will confirm your booking.
            </Text>
          </View>
        )}

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your payment information is secure and encrypted
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Pay Button */}
      {selectedMethod && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payBtn, loading && { opacity: 0.7 }]}
            onPress={handlePayment}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.payBtnText}>
                  Pay ${total} · {selectedMethodData?.name}
                </Text>
            }
          </TouchableOpacity>
        </View>
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

  amountCard: {
    margin: 20, backgroundColor: '#FF385C',
    borderRadius: 20, padding: 24, alignItems: 'center'
  },
  amountLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  amountValue: { fontSize: 48, fontWeight: '700', color: '#fff', marginBottom: 8 },
  amountListing: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  amountDates: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 12 },

  methodCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#eee', marginBottom: 10, backgroundColor: '#fafafa'
  },
  methodCardActive: { backgroundColor: '#fff' },
  methodIcon: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  methodName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#222' },
  radioBtn: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#ddd',
    justifyContent: 'center', alignItems: 'center'
  },

  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#222',
    backgroundColor: '#fff', marginBottom: 14
  },
  cardRow: { flexDirection: 'row', gap: 12 },

  mobileMoneyBox: {
    borderRadius: 12, padding: 14, marginBottom: 8
  },
  mobileMoneyText: { fontSize: 13, color: '#444', lineHeight: 20 },

  cashBox: {
    margin: 20, backgroundColor: '#f0fff4',
    borderRadius: 16, padding: 20, alignItems: 'center'
  },
  cashIcon: { fontSize: 48, marginBottom: 12 },
  cashTitle: { fontSize: 18, fontWeight: '700', color: '#00aa44', marginBottom: 8 },
  cashText: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 22 },

  securityNote: {
    marginHorizontal: 20, padding: 12,
    backgroundColor: '#f5f5f5', borderRadius: 10, alignItems: 'center'
  },
  securityText: { fontSize: 12, color: '#888' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopWidth: 1,
    borderTopColor: '#f0f0f0', padding: 20
  },
  payBtn: {
    backgroundColor: '#FF385C', borderRadius: 14,
    padding: 18, alignItems: 'center'
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  processingScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40
  },
  processingTitle: { fontSize: 22, fontWeight: '700', color: '#222', marginTop: 20, marginBottom: 8 },
  processingAmount: { fontSize: 40, fontWeight: '700', color: '#FF385C', marginBottom: 8 },
  processingSub: { fontSize: 14, color: '#888', textAlign: 'center' },

  successScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32
  },
  successIcon: { fontSize: 80, marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: '700', color: '#222', marginBottom: 8 },
  successAmount: { fontSize: 44, fontWeight: '700', color: '#FF385C', marginBottom: 8 },
  successSub: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 24 },
  successCard: {
    width: '100%', backgroundColor: '#f8f8f8',
    borderRadius: 16, padding: 16, marginBottom: 24
  },
  successRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  successLabel: { fontSize: 14, color: '#888' },
  successValue: { fontSize: 14, fontWeight: '600', color: '#222', flex: 1, textAlign: 'right' },
  successBtn: {
    width: '100%', backgroundColor: '#FF385C',
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12
  },
  successBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  successBtnOutline: {
    width: '100%', borderWidth: 1.5, borderColor: '#ddd',
    borderRadius: 14, padding: 16, alignItems: 'center'
  },
  successBtnOutlineText: { color: '#444', fontWeight: '600', fontSize: 16 },
});