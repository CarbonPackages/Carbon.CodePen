
import plugin from 'tailwindcss/plugin'

export default {
    theme: {
        extend: {
            colors: {
                'marcherry': '#D2042D',
            },
            spacing: {
              'makeTheButtonBigger': '42rem',
            },
        },
    },
    plugins: [
        plugin(function({ addVariant }) {
            addVariant('hocus', ['&:hover', '&:focus'])
        })
    ]
}
