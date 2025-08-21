// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import ProtectedRoute from '../components/PageComponent/ProtectedRoute';

// // Importe tes écrans
// import AccueilScreen from '../screens/AccueilScreen';
// import DashboardScreen from '../screens/Dashboard/DashboardScreen';
// import MyDataScreen from '../screens/Dashboard/MyData';
// import LoginScreen from '../screens/Authentication/LoginScreen';
// import RegisterScreen from '../screens/Authentication/RegisterScreen';
// import ResetPasswordScreen from '../screens/Authentication/ResetPasswordScreen';
// import VerifyCodeLoginScreen from '../screens/Authentication/VerifyCodeLoginScreen';
// import ForgotPasswordScreen from '../screens/Authentication/ForgotPasswordScreen';
// import CartScreen from '../screens/Cart/CartScreen';
// import CatalogueScreen from '../screens/Catalogue/CatalogueScreen';
// import CheckoutScreen from '../screens/Payment/CheckoutScreen';
// import ProductDetailScreen from '../screens/ProductDetailScreen';
// import WishlistScreen from '../screens/Wishlist/WishlistScreen';

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Accueil" screenOptions={{ headerShown: false }}>
//         {/* ✅ Routes publiques (accessibles sans authentification) */}
//         <Stack.Screen name="Accueil" component={AccueilScreen} />
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Register" component={RegisterScreen} />
//         <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
//         <Stack.Screen name="VerifyCodeLogin" component={VerifyCodeLoginScreen} />
//         <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//         <Stack.Screen name="Catalog" component={CatalogueScreen} />
//         <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

//         {/* ✅ Routes protégées (nécessitent une authentification) */}
//         <Stack.Screen name="Dashboard">
//           {(props) => (
//             <ProtectedRoute>
//               <DashboardScreen {...props} />
//             </ProtectedRoute>
//           )}
//         </Stack.Screen>

//         <Stack.Screen name="MyData">
//           {(props) => (
//             <ProtectedRoute>
//               <MyDataScreen {...props} />
//             </ProtectedRoute>
//           )}
//         </Stack.Screen>

//         <Stack.Screen name="Cart">
//           {(props) => (
//             <ProtectedRoute>
//               <CartScreen {...props} />
//             </ProtectedRoute>
//           )}
//         </Stack.Screen>

//         <Stack.Screen name="Checkout">
//           {(props) => (
//             <ProtectedRoute>
//               <CheckoutScreen {...props} />
//             </ProtectedRoute>
//           )}
//         </Stack.Screen>

//          <Stack.Screen name="Wishlist">
//           {(props) => (
//             <ProtectedRoute>
//               <WishlistScreen {...props} />
//             </ProtectedRoute>
//           )}
//         </Stack.Screen>

//         {/* ✅ Ajoutez ici d'autres routes protégées selon vos besoins */}
//         {/* 
//         <Stack.Screen name="Wishlist">
//           {(props) => (
//             <ProtectedRoute>
//               <WishlistScreen {...props} />
//             </ProtectedRoute>
//           )}
//         </Stack.Screen>

//         <Stack.Screen name="Success">
//           {(props) => (
//             <ProtectedRoute>
//               <SuccessScreen {...props} />
//             </ProtectedRoute>
//           )}
//         </Stack.Screen>
//         */}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProtectedRoute from '../components/PageComponent/ProtectedRoute';

// Importe tes écrans
import AccueilScreen from '../screens/AccueilScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import MyDataScreen from '../screens/Dashboard/MyData';
import LoginScreen from '../screens/Authentication/LoginScreen';
import RegisterScreen from '../screens/Authentication/RegisterScreen';
import ResetPasswordScreen from '../screens/Authentication/ResetPasswordScreen';
import VerifyCodeLoginScreen from '../screens/Authentication/VerifyCodeLoginScreen';
import ForgotPasswordScreen from '../screens/Authentication/ForgotPasswordScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CatalogueScreen from '../screens/Catalogue/CatalogueScreen';
import CheckoutScreen from '../screens/Payment/CheckoutScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import WishlistScreen from '../screens/Wishlist/WishlistScreen';

// Ajoutez cette importation pour votre SuccessScreen
import SuccessScreen from '../screens/Payment/SuccessScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil" screenOptions={{ headerShown: false }}>
        {/* ✅ Routes publiques (accessibles sans authentification) */}
        <Stack.Screen name="Accueil" component={AccueilScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="VerifyCodeLogin" component={VerifyCodeLoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Catalog" component={CatalogueScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

        {/* ✅ Routes protégées (nécessitent une authentification) */}
        <Stack.Screen name="Dashboard">
          {(props) => (
            <ProtectedRoute>
              <DashboardScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="MyData">
          {(props) => (
            <ProtectedRoute>
              <MyDataScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Cart">
          {(props) => (
            <ProtectedRoute>
              <CartScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Checkout">
          {(props) => (
            <ProtectedRoute>
              <CheckoutScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>
        
        {/* ✅ Nouvelle route pour la page de succès */}
        <Stack.Screen 
          name="SuccessScreen"
          options={{
            headerShown: false,
            gestureEnabled: false, // Empêche le retour par swipe sur iOS
          }}
        >
          {(props) => (
            <ProtectedRoute>
              <SuccessScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Wishlist">
          {(props) => (
            <ProtectedRoute>
              <WishlistScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        {/* ✅ Ajoutez ici d'autres routes protégées selon vos besoins */}
        {/*
        <Stack.Screen name="OtherProtectedScreen">
          {(props) => (
            <ProtectedRoute>
              <OtherProtectedScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}