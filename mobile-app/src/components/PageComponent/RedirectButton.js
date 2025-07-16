import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RedirectButton = ({
  to,
  fallback = 'Login',    // route alternative (nom de l'écran)
  condition = true,
  children,
  style = {},
  textStyle = {},
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    const destination = condition ? to : fallback;
    navigation.navigate(destination);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: '#6366F1', // indigo-500
          paddingVertical: 12,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: 'white',
            fontWeight: '600',
            fontSize: 16,
            // Pour un dégradé, il faudrait un composant supplémentaire (expo-linear-gradient),
            // ici on met juste une couleur simple.
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default RedirectButton;
