'use client'

import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme/theme'; // Chemin vers votre fichier theme.js
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Initialisation GSAP (optionnel - seulement si vous voulez des animations globales)
const initGSAP = () => {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // Animation de base pour les cartes propriétés
    gsap.utils.toArray('.property-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        }
      });
    });
  }
};

export function Provider({ children }) {
  useEffect(() => {
    initGSAP();
  }, []);

  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}