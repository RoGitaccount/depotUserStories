// src/components/ScreenWrapper.js
import React from 'react';
import { View, ScrollView } from 'react-native';
import Navbar from './Navbar';

export default function ScreenWrapper({ children, scrollable = true }) {
  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      {scrollable ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {children}
        </View>
      )}
    </View>
  );
}