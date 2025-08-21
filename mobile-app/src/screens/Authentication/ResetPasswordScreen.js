import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../../components/PageComponent/screenWrapper';

export default function ResetPasswordScreen () {
  return (
    <ScreenWrapper>
    <View style={styles.container}>
      <Text style={styles.text}>ResetPasswordScreen (à compléter)</Text>
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
  text: { fontSize: 22, fontWeight: 'bold' },
});