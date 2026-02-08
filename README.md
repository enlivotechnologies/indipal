# Indipal

A professional Expo app with NativeWind (Tailwind CSS) and file-based routing.

## Tech Stack

- **Expo** – React Native development platform
- **Expo Router** – File-based routing with React Navigation
- **NativeWind** – Tailwind CSS for React Native
- **TypeScript** – Type safety
- **pnpm** – Fast, disk space efficient package manager

## Project Structure

```
indipal/
├── app/                    # Screens & routes (file-based routing)
│   ├── _layout.tsx         # Root layout with navigation
│   ├── (tabs)/             # Tab navigator screens
│   │   ├── _layout.tsx     # Tab bar configuration
│   │   ├── index.tsx       # Home screen
│   │   └── explore.tsx     # Explore screen
│   └── modal.tsx           # Modal screen
├── assets/                 # Images, fonts, etc.
├── components/             # Reusable UI components
├── constants/              # Theme, config constants
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & helpers
├── types/                  # TypeScript type definitions
├── global.css              # Tailwind CSS entry
├── tailwind.config.js      # Tailwind configuration
└── nativewind-env.d.ts     # NativeWind TypeScript types
```

## Get Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Install & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start
```

Then:

- Press **i** for iOS simulator
- Press **a** for Android emulator
- Press **w** for web browser
- Scan QR code for Expo Go on device

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo dev server |
| `pnpm android` | Run on Android |
| `pnpm ios` | Run on iOS |
| `pnpm web` | Run on web |
| `pnpm lint` | Run ESLint |

## NativeWind Usage

Use Tailwind classes via the `className` prop:

```tsx
import { View, Text } from 'react-native';

export default function MyScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Text className="text-xl font-bold text-gray-900 dark:text-white">
        Hello NativeWind!
      </Text>
    </View>
  );
}
```

For conditional classes, use the `cn()` utility from `@/lib/utils`:

```tsx
import { cn } from '@/lib/utils';

<View className={cn('p-4 rounded-lg', isActive && 'bg-blue-500')} />
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
# indipal
