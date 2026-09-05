import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { injectWebStyles } from './src/injectWebStyles';
import { CameraScreen } from './src/screens/CameraScreen';
import { colors } from './src/theme';

export default function App() {
  useEffect(() => {
    injectWebStyles();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
