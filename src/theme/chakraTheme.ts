import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#ef4444', // primary red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
        backgroundColor: '#0b1020',
      },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'red' },
    },
  },
});

export default theme;
