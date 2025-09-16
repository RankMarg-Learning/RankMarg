import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
				  50: '#fefce8',
				  100: '#fef9c3',
				  200: '#fef08a',
				  300: '#fde047',
				  400: '#facc15',
				  500: '#eab308', 
				  600: '#ca8a04',
				  700: '#a16207',
				  800: '#854d0e',
				  900: '#713f12',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
			'skew-scroll': {
            '0%': {
              transform: 'rotateX(20deg) rotateZ(-20deg) skewX(20deg)',
            },
            '100%': {
              transform: 'rotateX(20deg) rotateZ(-20deg) skewX(20deg) translateY(-100%)',
            },
          },

  		},
  		animation: {
			'skew-scroll': 'skew-scroll 20s linear infinite', //1
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  safelist: [
    "border-purple-200", "bg-gradient-to-br", "from-purple-50", "to-purple-100/30","bg-purple-400",
    "border-amber-200", "from-amber-50", "to-amber-100/30","bg-amber-400",
    "border-green-200", "from-green-50", "to-green-100/30",
	"bg-green-400",
    "border-blue-200", "from-blue-50", "to-blue-100/30",
	"bg-blue-400",
    "border-gray-200", "from-gray-50", "to-gray-100/30",
	"bg-gray-400"
  ],
  plugins: [require("tailwindcss-animate"),require('@tailwindcss/typography')],
};
export default config;
