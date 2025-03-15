'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Configuration du thème avec le mode couleur par défaut
const theme = extendTheme({
  config: {
    initialColorMode: 'light', // Mode light par défaut
    useSystemColorMode: false, // Désactiver la détection automatique du système
  },
});

export function Provider({ children }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}