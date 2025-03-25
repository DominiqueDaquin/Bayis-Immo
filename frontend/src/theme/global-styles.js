import { Global, css } from '@emotion/react';
import { colors } from './colors';

export const GlobalStyles = () => (
  <Global
    styles={css`
      /* Optimisation des polices */
      @font-face {
        font-family: 'Raleway';
        font-style: normal;
        font-display: swap;
        src: local('Raleway'), url(/fonts/raleway.woff2) format('woff2');
      }
      
      @font-face {
        font-family: 'Playfair Display';
        font-style: normal;
        font-display: swap;
        src: local('Playfair Display'), url(/fonts/playfair-display.woff2) format('woff2');
      }

      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }

      /* Sélection de texte */
      ::selection {
        background-color: ${colors.primary[500]};
        color: white;
      }

      /* Styles pour les images */
      img {
        max-width: 100%;
        height: auto;
        vertical-align: middle;
      }

      /* Animation de fond pour les sections */
      .animated-bg {
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            ${colors.primary[50]} 0%,
            ${colors.secondary[50]} 100%
          );
          z-index: -1;
          opacity: 0.15;
        }
      }
    `}
  />
);