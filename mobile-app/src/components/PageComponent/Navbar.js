// import React, { useContext, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   SafeAreaView,
//   StatusBar,
//   Modal,
//   ScrollView,
//   Alert
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { useColorScheme } from 'nativewind';
// import { AuthContext } from '../../contexts/AuthContext';
// import { Feather } from '@expo/vector-icons';

// const Navbar = () => {
//   const { isAuthenticated, logout, user } = useContext(AuthContext) || {};
//   const navigation = useNavigation();
//   const [search, setSearch] = useState('');
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const { colorScheme, setColorScheme } = useColorScheme();

//   // Charger le thème depuis AsyncStorage au démarrage
//   useEffect(() => {
//     const loadTheme = async () => {
//       try {
//         const theme = await AsyncStorage.getItem('theme');
//         if (theme) {
//           setColorScheme(theme === 'dark' ? 'dark' : 'light');
//         }
//       } catch (error) {
//         console.error('Erreur lors du chargement du thème:', error);
//       }
//     };
//     loadTheme();
//   }, []);

//   const toggleDarkMode = async () => {
//     const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
//     setColorScheme(newScheme);
//     try {
//       await AsyncStorage.setItem('theme', newScheme);
//     } catch (error) {
//       console.error('Erreur lors de la sauvegarde du thème:', error);
//     }
//   };

//   const handleSearch = () => {
//     console.log("Recherche :", search);
//     // TODO: Ajout appel API
//   };

//   const handleLogout = () => {
//     Alert.alert(
//       "Déconnexion",
//       "Êtes-vous sûr de vouloir vous déconnecter ?",
//       [
//         {
//           text: "Annuler",
//           style: "cancel"
//         },
//         {
//           text: "Déconnexion",
//           style: "destructive",
//           onPress: () => {
//             if (logout) logout();
//             navigation.navigate('Login');
//           }
//         }
//       ]
//     );
//   };

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const navigateAndCloseMenu = (screenName) => {
//     setIsMobileMenuOpen(false);
//     navigation.navigate(screenName);
//   };

//   const NavButton = ({ onPress, icon, text, isGradient = false, gradientColors, textColorClass, bgClass, hoverClass }) => (
//     <TouchableOpacity onPress={onPress} className="my-1 rounded-xl overflow-hidden">
//       {isGradient ? (
//         <LinearGradient
//           colors={gradientColors}
//           className="px-4 py-3 flex-row items-center"
//         >
//           <Feather name={icon} size={18} color="#ffffff" />
//           <Text className="ml-2 text-base font-semibold text-white">
//             {text}
//           </Text>
//         </LinearGradient>
//       ) : (
//         <View className={`px-4 py-3 flex-row items-center ${bgClass || ''} ${hoverClass || ''}`}>
//           <Feather 
//             name={icon}
//             size={18} 
//             color={colorScheme === 'dark' ? '#e5e7eb' : '#6366f1'} 
//           />
//           <Text className={`ml-2 text-base font-semibold ${textColorClass || 'text-indigo-600 dark:text-gray-200'}`}>
//             {text}
//           </Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <>
//       <View className="bg-white dark:bg-gray-800" style={{ paddingTop: StatusBar.currentHeight || 0 }}>
//         <StatusBar
//           barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"}
//           backgroundColor={colorScheme === 'dark' ? "#1f2937" : "#ffffff"}
//         />
//         <View className="flex-row items-center justify-between px-4 py-4 bg-white/90 dark:bg-gray-800/90 shadow-lg border-b border-gray-200 dark:border-gray-700">
//           {/* Logo */}
//           <TouchableOpacity
//             onPress={() => navigation.navigate('Accueil')}
//             className="flex-row items-center"
//           >
//             <LinearGradient
//               colors={['#6366f1', '#8b5cf6']}
//               className="w-10 h-10 rounded-xl items-center justify-center mr-2"
//             >
//               <Text className="text-white text-lg font-bold">C</Text>
//             </LinearGradient>
//             <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
//               Cyna
//             </Text>
//           </TouchableOpacity>

//           {/* Actions à droite */}
//           <View className="flex-row items-center space-x-3">
//             {/* Barre de recherche */}
//             <View className="flex-row items-center px-3 py-2 rounded-full border bg-white/80 dark:bg-gray-700/80 border-gray-300 dark:border-gray-600 w-32 mr-2">
//               <TouchableOpacity onPress={handleSearch} className="mr-2">
//                 <Feather name="search" size={18} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
//               </TouchableOpacity>
//               <TextInput
//                 value={search}
//                 onChangeText={setSearch}
//                 onSubmitEditing={handleSearch}
//                 placeholder="Recherche..."
//                 placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
//                 className="flex-1 text-sm text-gray-900 dark:text-white"
//               />
//             </View>

//             {/* Toggle Light/Dark */}
//             <TouchableOpacity onPress={toggleDarkMode} className="rounded-full overflow-hidden mr-2">
//               <LinearGradient
//                 colors={colorScheme === 'dark' ? ['#6366f1', '#8b5cf6'] : ['#f97316', '#facc15']}
//                 className="p-2 items-center justify-center"
//               >
//                 {colorScheme === 'dark' ? <Feather name="sun" size={20} color="#ffffff" /> : <Feather name="moon" size={20} color="#ffffff" />}
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Bouton Menu Mobile */}
//             <TouchableOpacity 
//               onPress={toggleMobileMenu} 
//               className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-700/50"
//             >
//               {isMobileMenuOpen ? (
//                 <Feather name="x" size={24} color={colorScheme === 'dark' ? '#d1d5db' : '#4b5563'} />
//               ) : (
//                 <Feather name="menu" size={24} color={colorScheme === 'dark' ? '#d1d5db' : '#4b5563'} />
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Menu Mobile Modal */}
//       <Modal
//         visible={isMobileMenuOpen}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setIsMobileMenuOpen(false)}
//       >
//         <View className="flex-1 bg-black/50 justify-end">
//           <View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-4/5 pt-5">
//             <ScrollView className="px-4 pb-5">
//               {isAuthenticated && (
//                 <>
//                   <NavButton
//                     onPress={() => navigateAndCloseMenu('Cart')}
//                     icon="shopping-cart"
//                     text="Panier"
//                     textColorClass="text-indigo-600 dark:text-indigo-300"
//                     hoverClass="active:bg-indigo-50 dark:active:bg-indigo-900/50"
//                   />
//                   <NavButton
//                     onPress={() => navigateAndCloseMenu('Wishlist')}
//                     icon="heart"
//                     text="Wishlist"
//                     textColorClass="text-pink-600 dark:text-pink-300"
//                     hoverClass="active:bg-pink-50 dark:active:bg-pink-900/20"
//                   />
//                   <NavButton
//                     onPress={() => navigateAndCloseMenu('Checkout')}
//                     icon="credit-card"
//                     text="Checkout"
//                     textColorClass="text-green-600 dark:text-green-300"
//                     hoverClass="active:bg-green-50 dark:active:bg-green-900/20"
//                   />
//                   <NavButton
//                     onPress={() => navigateAndCloseMenu('Dashboard')}
//                     icon="user"
//                     text="Mon compte"
//                     textColorClass="text-blue-600 dark:text-blue-300"
//                     hoverClass="active:bg-blue-50 dark:active:bg-blue-900/20"
//                   />
//                 </>
//               )}

//               <NavButton
//                 onPress={() => navigateAndCloseMenu('Catalog')}
//                 icon="grid"
//                 text="Catalogue"
//                 textColorClass="text-purple-600 dark:text-purple-300"
//                 hoverClass="active:bg-purple-50 dark:active:bg-purple-900/20"
//               />

//               {!isAuthenticated && (
//                 <>
//                   <NavButton
//                     onPress={() => navigateAndCloseMenu('Register')}
//                     icon="user-plus"
//                     text="Inscription"
//                     isGradient={true}
//                     gradientColors={['#f97316', '#facc15']}
//                   />
//                   <NavButton
//                     onPress={() => navigateAndCloseMenu('Login')}
//                     icon="log-in"
//                     text="Connexion"
//                     isGradient={true}
//                     gradientColors={['#6366f1', '#8b5cf6']}
//                   />
//                 </>
//               )}

//               {/* Déconnexion Mobile */}
//               {isAuthenticated && (
//                 <TouchableOpacity
//                   onPress={() => {
//                     setIsMobileMenuOpen(false);
//                     handleLogout();
//                   }}
//                   className="flex-row items-center px-4 py-3 my-1 rounded-xl bg-red-50 dark:bg-red-900/10 active:bg-red-100 dark:active:bg-red-900/20"
//                 >
//                   <Feather name="log-out" size={16} color="#ef4444" />
//                   <Text className="ml-2 text-base font-semibold text-red-500">Déconnexion</Text>
//                 </TouchableOpacity>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// export default Navbar;


















// src/components/Navbar.js
import React, { useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { useColorScheme } from 'nativewind';

export default function Navbar() {
  const { isAuthenticated, logout, user, loading } = useContext(AuthContext) || {};
  const navigation = useNavigation();
  const [search, setSearch] = React.useState('');
  const { colorScheme, setColorScheme } = useColorScheme();

  if (loading) {
    return null; // ou un petit loader
  }

  const toggleDarkMode = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème :', error);
    }
  };

  // Charger le thème depuis AsyncStorage au démarrage
  // Navbar.js
useEffect(() => {
  console.log('[Navbar] isAuthenticated=', isAuthenticated, 'user=', user);
}, [isAuthenticated, user]);

useEffect(() => {
  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved && saved !== colorScheme) {
        setColorScheme(saved);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème :', error);
    }
  };
  loadTheme();
}, []);

  // useEffect(() => {
  //   const loadTheme = async () => {
  //     try {
  //       const saved = await AsyncStorage.getItem('theme');
  //       if (saved) setColorScheme(saved === 'dark' ? 'dark' : 'light');
  //     } catch (error) {
  //       console.error('Erreur lors du chargement du thème :', error);
  //     }
  //   };
  //   loadTheme();
  // }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Attendre un petit délai pour que le contexte se mette à jour
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 100);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    }
  };

  return (
    <View className="p-4 bg-white dark:bg-zinc-800">
      <Text className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">Cyna</Text>

      <View className="flex-row flex-wrap gap-3 mb-4">
        <TouchableOpacity onPress={() => navigation.navigate('Accueil')}>
          <Text className="text-gray-800 dark:text-gray-100">Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
          <Text className="text-gray-800 dark:text-gray-100">Catalogue</Text>
        </TouchableOpacity>



        {isAuthenticated ? (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
              <Text className="text-gray-800 dark:text-gray-100">Panier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
              <Text className="text-gray-800 dark:text-gray-100">Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Checkout')}>
              <Text className="text-gray-800 dark:text-gray-100">Checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
              <Text className="text-gray-800 dark:text-gray-100">Mon compte</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text className="text-red-600 dark:text-red-400">Déconnexion</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-gray-800 dark:text-gray-100">Inscription</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-gray-800 dark:text-gray-100">Connexion</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View className="flex-row items-center">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Recherche..."
          placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-700"
        />
        <TouchableOpacity onPress={toggleDarkMode} className="ml-2">
          <Text className="text-2xl">
            {colorScheme === 'dark' ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}