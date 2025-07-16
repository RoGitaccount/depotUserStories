import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importe tes écrans (à créer dans src/screens/)
import AccueilScreen from '../screens/AccueilScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import LoginScreen from '../screens/Authentication/LoginScreen';
import RegisterScreen from '../screens/Authentication/RegisterScreen';
import ResetPasswordScreen from '../screens/Authentication/ResetPasswordScreen';
import VerifyCodeLoginScreen from '../screens/Authentication/VerifyCodeLoginScreen';
import ForgotPasswordScreen from '../screens/Authentication/ForgotPasswordScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CatalogueScreen from '../screens/Catalogue/CatalogueScreen';
// import WishlistScreen from '../screens/Wishlist/WishlistScreen';
import CheckoutScreen from '../screens/Payment/CheckoutScreen';
// import SuccessScreen from '../screens/Payment/SuccessScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
// import DashboardAdminScreen from '../screens/Admin/DashboardAdminScreen'; // à ajouter si tu veux l'admin sur mobile

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Accueil" component={AccueilScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="VerifyCodeLogin" component={VerifyCodeLoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Catalog" component={CatalogueScreen} />
        {/* <Stack.Screen name="Wishlist" component={WishlistScreen} /> */}
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        {/* <Stack.Screen name="Success" component={SuccessScreen} /> */}
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        {/* <Stack.Screen name="DashboardAdmin" component={DashboardAdminScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}