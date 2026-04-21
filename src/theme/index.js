import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
    },
    fonts: {
        heading: `'Montserrat', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    colors: {
        brand: {
            50: '#e0f7fa',
            100: '#b2ebf2',
            200: '#80deea',
            300: '#4dd0e1',
            400: '#26c6da',
            500: '#22d3ee', // cyan-400
            600: '#00bcd4',
            700: '#00acc1',
            800: '#0097a7',
            900: '#006064',
        },
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
        },
    },
    semanticTokens: {
        colors: {
            /* Surface / background layers */
            'surface.primary': {
                default: '#ffffff',
                _dark: '#0f172a',
            },
            'surface.secondary': {
                default: '#f3f4f6',
                _dark: '#1e293b',
            },
            'surface.tertiary': {
                default: '#e5e7eb',
                _dark: '#0b1220',
            },
            'surface.card': {
                default: '#ffffff',
                _dark: 'rgba(30, 41, 59, 0.6)',
            },
            'surface.header': {
                default: 'rgba(255, 255, 255, 0.92)',
                _dark: 'rgba(17, 24, 39, 0.9)',
            },

            /* Text */
            'text.primary': {
                default: 'gray.900',
                _dark: 'gray.100',
            },
            'text.secondary': {
                default: 'gray.600',
                _dark: 'gray.300',
            },
            'text.muted': {
                default: 'gray.500',
                _dark: 'gray.400',
            },

            /* Borders */
            'border.default': {
                default: 'gray.200',
                _dark: 'gray.800',
            },
            'border.subtle': {
                default: 'gray.100',
                _dark: 'gray.700',
            },

            /* Misc */
            'accent.glow': {
                default: 'rgba(34, 211, 238, 0.12)',
                _dark: 'rgba(34, 211, 238, 0.15)',
            },
        },
    },
    styles: {
        global: (props) => ({
            body: {
                bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
                color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
                transition: 'background-color 0.3s ease, color 0.3s ease',
            },
        }),
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'semibold',
                borderRadius: '8px',
            },
            variants: {
                primary: (props) => ({
                    bg: 'brand.500',
                    color: props.colorMode === 'dark' ? 'gray.900' : 'white',
                    _hover: {
                        bg: 'brand.600',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(34, 211, 238, 0.5)',
                    },
                    transition: 'all 0.3s',
                }),
                secondary: (props) => ({
                    bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
                    color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
                    border: '2px solid',
                    borderColor: 'brand.500',
                    _hover: {
                        bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
                    },
                }),
                ghost: (props) => ({
                    bg: 'transparent',
                    color: props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
                    border: '1px solid',
                    borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
                    _hover: {
                        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
                    },
                }),
            },
        },
        Input: {
            baseStyle: {
                field: {
                    bg: 'var(--color-bg-input)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'md',
                    _hover: {
                        borderColor: 'var(--color-border-hover)',
                    },
                    _focus: {
                        borderColor: 'var(--color-cyan-400)',
                        boxShadow: '0 0 0 4px var(--color-focus-glow)',
                    },
                    _placeholder: {
                        color: 'var(--color-text-muted)',
                    },
                },
            },
            defaultProps: {
                variant: 'unstyled', // use the baseStyle we just created
            },
        },
    },
    shadows: {
        custom: '0px 4px 16px rgba(34, 211, 238, 0.3)',
        customHover: '0px 8px 24px rgba(34, 211, 238, 0.5)',
    },
});

export default theme;
