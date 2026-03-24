/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                sonatrach: {
                    green: '#1B6B3A',
                    'green-light': '#22883F',
                    'green-dark': '#144F2B',
                    gold: '#C8960C',
                    'gold-light': '#DBA80E',
                    'gold-dark': '#9E780A',
                },
                navy: {
                    DEFAULT: '#1A2F45',
                    mid: '#243B53',
                    light: '#2E4A66',
                },
                dark: {
                    base: '#0D1117',
                    surface: '#161B22',
                    elevated: '#21262D',
                    border: '#30363D',
                },
            },
            fontFamily: {
                display: ['"DM Sans"', '"Plus Jakarta Sans"', 'sans-serif'],
                body: ['"IBM Plex Sans"', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'monospace'],
            },
            animation: {
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
                'pulse-badge': 'pulse-badge 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 250ms ease forwards',
                'slide-up': 'slideUp 250ms ease forwards',
                'scale-in': 'scaleIn 200ms ease forwards',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
}
