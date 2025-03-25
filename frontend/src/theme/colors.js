// @/theme/color.js

export const colors = {
  primary: {
    50: '#F0F7F7',
    100: '#D9EAEA',
    200: '#B3D5D5',
    300: '#8CBFBF',
    400: '#66AAAA',
    500: '#4D9595', // Couleur principale - vert-bleu apaisant
    600: '#3D7777',
    700: '#2E5A5A',
    800: '#1E3C3C',
    900: '#0F1E1E',
  },
  
  secondary: {
    50: '#F7F4ED',
    100: '#EAE3D1',
    200: '#D5C7A3',
    300: '#C0AB76',
    400: '#AB8F48',
    500: '#8A7339', // Couleur secondaire - doré/taupe chaleureux
    600: '#6F5C2E',
    700: '#544522',
    800: '#392E17',
    900: '#1D170B',
  },
  
  accent: {
    50: '#FDF1ED',
    100: '#F9D9CE',
    200: '#F4B39D',
    300: '#EE8D6C',
    400: '#E9673B',
    500: '#D14E25', // Couleur d'accent - terracotta subtil
    600: '#A73E1E',
    700: '#7D2F16',
    800: '#531F0F',
    900: '#2A1007',
  },
  
  neutral: {
    50: '#F5F4F1',  // Fond clair (au lieu de blanc pur)
    100: '#EBE9E4',  // Alternative aux backgrounds blancs
    200: '#DCD9D0',
    300: '#C8C4B7',
    400: '#B4AE9E',
    500: '#A09884',
    600: '#80796A',
    700: '#605A4F',
    800: '#403C35',
    900: '#201E1A',
  },
  
  status: {
    success: {
      50: '#EEF6EE',
      500: '#5A9A67',
      700: '#3D6745',
    },
    error: {
      50: '#F9EDED',
      500: '#C05252',
      700: '#8A3A3A',
    },
    warning: {
      50: '#F8F4E8',
      500: '#D4A548',
      700: '#8E6F31',
    },
    info: {
      50: '#EDF3F7',
      500: '#5889A9',
      700: '#3B5D73',
    }
  },

  // Couleurs spécifiques pour les propriétés immobilières
  property: {
    residential: {
      100: '#E8F4F5',
      300: '#A8D5D9',
      500: '#68A7AD',
    },
    commercial: {
      100: '#ECF2F5',
      300: '#AECAD8',
      500: '#6F9DB7',
    },
    luxury: {
      100: '#F0EDE5',
      300: '#D1C4A8',
      500: '#B29B6B',
    },
    newbuild: {
      100: '#EDF5ED',
      300: '#BFD9C0',
      500: '#7EA880',
    }
  }
};

// Variantes de couleurs pour différentes sections du site
export const themeVariants = {
  // Pour les pages d'accueil et de navigation
  main: {
    background: colors.neutral[50],
    cardBackground: colors.neutral[100],
    text: colors.neutral[800],
    subtleText: colors.neutral[600],
    border: colors.neutral[200]
  },
  
  // Pour les pages de recherche et résultats
  search: {
    background: colors.neutral[100],
    cardBackground: '#FFFFFF',
    highlightBackground: colors.primary[50],
    text: colors.neutral[800],
    subtleText: colors.neutral[600]
  },
  
  // Pour les pages de détail de propriété
  propertyDetail: {
    background: colors.neutral[50],
    sectionBackground: colors.neutral[100],
    accentBackground: colors.primary[50],
    priceText: colors.secondary[600],
    featureIcon: colors.primary[500]
  },
  
  // Pour le tableau de bord utilisateur
  dashboard: {
    background: colors.neutral[100],
    cardBackground: '#FFFFFF',
    accent: colors.primary[500],
    subtleAccent: colors.primary[100],
    notification: colors.accent[500]
  }
};

// Configurations pour le mode sombre
export const darkMode = {
  primary: colors.primary[600],
  secondary: colors.secondary[600],
  accent: colors.accent[500],
  background: '#1F2122', // Fond sombre chaud (pas noir pur)
  cardBackground: '#2A2D2F',
  text: colors.neutral[100],
  subtleText: colors.neutral[300],
  border: colors.neutral[700]
};

export default colors;