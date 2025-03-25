// @/theme/theme.js

import { extendTheme } from '@chakra-ui/react';
import colors from './colors';
import { components } from './components';

const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px'
};

const space = {
  'property-card': '24px',
  'section': '48px'
};

const theme = extendTheme({
  colors,
  fonts: {
    heading: "'Poppins', -apple-system, sans-serif", 
    body: "'Poppins', -apple-system, sans-serif",    
    mono: "'Roboto Mono', monospace"                
  },
  fontSizes: {
    xs: '0.75rem',    
    sm: '0.875rem',   
    md: '1rem',       
    lg: '1.125rem',   
    xl: '1.375rem',   
    '2xl': '1.75rem', 
    '3xl': '2.25rem', 
    '4xl': '3rem'     
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  breakpoints,
  space,
  components,
  styles: {
    global: (props) => ({
      'html, body': {
        color: props.colorMode === 'dark' ? 'neutral.100' : 'neutral.800',
        bg: props.colorMode === 'dark' ? 'neutral.900' : 'neutral.50',
        scrollBehavior: 'smooth',
        fontFeatureSettings: '"kern", "liga", "clig", "calt"'
      },
      '@import': [
        'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto+Mono&display=swap'
      ],
    
      '@font-face': [
        {
          fontFamily: 'Poppins',
          fontDisplay: 'swap',
          src: 'local("Poppins"), local("Poppins-Regular"), url(/fonts/poppins.woff2) format("woff2")'
        }
      ]
    })
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
    cssVarPrefix: 'immo'
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl', '4xl'],
      fontWeight: 'bold',
      lineHeight: 'shorter'
    },
    h2: {
      fontSize: ['xl', '2xl', '3xl'],
      fontWeight: 'semibold',
      lineHeight: 'shorter'
    },
    highlight: {
      fontWeight: '600',
      color: 'accent.500'
    }
  }
});

export default theme;