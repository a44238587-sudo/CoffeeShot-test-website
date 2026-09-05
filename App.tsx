import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { injectWebStyles } from './src/injectWebStyles';
import { CameraScreen } from './src/screens/CameraScreen';
import { colors } from './src/theme';

export default function App() {
  useEffect(() => {
    injectWebStyles();
  }, []);

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <View style={styles.phone}>
        <CameraScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#050403',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          maxHeight: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
        }
      : null),
  },
});
