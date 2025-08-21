// import "./global.css";
// import React from "react";
// import AppNavigator from "./src/navigation/AppNavigator";
// import { AuthProvider } from './src/contexts/AuthProvider';
// import { ThemeProvider } from 'nativewind'; 

// console.log(React);
// console.log(AppNavigator);
// console.log(AuthProvider);
// console.log(ThemeProvider);


// export default function App() {
//   return (
//     // <ThemeProvider>
//       <AuthProvider>
//         <AppNavigator />
//       </AuthProvider>
//     // </ThemeProvider>
//   );
// }


// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthProvider';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css'; // Si vous utilisez NativeWind

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}