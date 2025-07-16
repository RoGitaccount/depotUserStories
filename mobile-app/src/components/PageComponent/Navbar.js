// src/components/NavbarNative.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext'; // attention au chemin
import { useNavigation } from '@react-navigation/native';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useContext(AuthContext) || {};
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // gérer le dark mode à ta façon

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // ici tu peux utiliser Context ou un thème pour gérer le mode sombre
  };

  const handleLogout = () => {
    if (logout) logout();
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.navbar, isDarkMode && styles.navbarDark]}>
      <Text style={styles.logo}>Cyna</Text>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Accueil')}>
          <Text style={styles.link}>Accueil</Text>
        </TouchableOpacity>
        {isAuthenticated && (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
              <Text style={styles.link}>Panier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Wishlist')}>
              <Text style={styles.link}>Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.link}>Checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
              <Text style={styles.link}>Mon compte</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
          <Text style={styles.link}>Catalogue</Text>
        </TouchableOpacity>
        {user?.role === 'admin' && (
          <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
            <Text style={[styles.link, { color: 'red' }]}>Admin</Text>
          </TouchableOpacity>
        )}
        {isAuthenticated ? (
          <TouchableOpacity onPress={handleLogout}>
            <Text style={[styles.link, { color: 'red' }]}>Déconnexion</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Inscription</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Connexion</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Recherche..."
          style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
        />
        <TouchableOpacity onPress={toggleDarkMode} style={styles.darkModeBtn}>
          <Text style={{ color: isDarkMode ? 'yellow' : 'gray' }}>
            {isDarkMode ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    padding: 10,
    backgroundColor: 'white',
  },
  navbarDark: {
    backgroundColor: '#333',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#4f46e5', // indigo-700
    marginBottom: 10,
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  link: {
    marginRight: 15,
    fontSize: 16,
    color: '#1f2937', // gray-800
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderColor: '#d1d5db', // gray-300
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: '#111827', // gray-900
  },
  searchInputDark: {
    borderColor: '#4b5563', // gray-600
    color: 'white',
    backgroundColor: '#1f2937',
  },
  darkModeBtn: {
    marginLeft: 8,
  },
});
