import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveNotification = async (notif) => {
  try {
    const stored = await AsyncStorage.getItem('notifications');
    const current = stored ? JSON.parse(stored) : [];
    const newNotif = {
      id: Date.now().toString(),
      ...notif,
      time: 'Just now',
      read: false,
    };
    const updated = [newNotif, ...current];
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  } catch (err) {
    console.log(err);
  }
};