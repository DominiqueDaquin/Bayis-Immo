import { mode } from '@chakra-ui/theme-tools';

export const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
      transition: 'all 0.2s',
    },
    variants: {
      primary: (props) => ({
        bg: mode('primary.500', 'primary.600')(props),
        color: 'white',
        _hover: {
          bg: mode('primary.600', 'primary.500')(props),
          transform: 'translateY(-2px)',
          boxShadow: 'md',
          _disabled: {
            bg: mode('primary.500', 'primary.600')(props)
          }
        },
        _active: {
          bg: mode('primary.700', 'primary.400')(props)
        }
      }),
      secondary: (props) => ({
        bg: mode('secondary.500', 'secondary.600')(props),
        color: 'white',
        _hover: {
          bg: mode('secondary.600', 'secondary.500')(props),
          transform: 'translateY(-2px)',
          boxShadow: 'md'
        }
      }),
    },
    defaultProps: {
      variant: 'primary'
    }
  },
  Card: {
    baseStyle: (props) => ({
      bg: mode('white', 'neutral.800')(props),
      borderRadius: 'xl',
      boxShadow: 'md',
      borderWidth: '1px',
      borderColor: mode('neutral.100', 'neutral.700')(props),
      transition: 'transform 0.3s, box-shadow 0.3s'
    }),
    variants: {
      property: (props) => ({
        _hover: {
          transform: 'translateY(-5px)',
          boxShadow: 'xl',
          borderColor: mode('primary.200', 'primary.300')(props)
        }
      })
    }
  },
  StatusBadge: {
    baseStyle: {
      borderRadius: 'full',
      px: 3,
      py: 1,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      fontSize: 'xs'
    },
    variants: {
      available: {
        bg: 'status.success.50',
        color: 'status.success.700'
      },
      sold: {
        bg: 'status.error.50',
        color: 'status.error.700'
      },
      pending: {
        bg: 'status.warning.50',
        color: 'status.warning.700'
      }
    }
  },
  PriceTag: {
    baseStyle: (props) => ({
      color: mode('secondary.600', 'secondary.300')(props),
      fontWeight: 'bold',
      fontSize: 'xl',
      fontFamily: 'mono'
    })
  }
};