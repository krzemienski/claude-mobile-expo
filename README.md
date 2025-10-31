# Claude Code Mobile - React Native Expo App

Mobile client for Claude Code, enabling AI-powered code assistance on iOS devices.

## Project Structure

```
claude-mobile-expo/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Business logic and API services
│   ├── store/           # State management
│   ├── utils/           # Utility functions
│   ├── theme/           # Design system and styling
│   └── types/           # TypeScript type definitions
├── assets/              # Images, fonts, and static files
├── docs/                # Documentation
├── expo/                # Expo configuration
├── App.tsx              # Root component
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or physical iOS device
- Claude Code server running locally

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android (future)
npm run android
```

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

### Code Style

This project uses:
- **TypeScript** for type safety
- **ESLint** for linting
- **Prettier** for code formatting
- **8-point grid system** for spacing
- **System fonts** for optimal native rendering

### Design System

The app follows a cohesive design system defined in `src/theme/theme.ts`:

- **Colors**: Deep purple-blue gradient aesthetic with teal accents
- **Typography**: System fonts (San Francisco on iOS)
- **Spacing**: 8-point grid system (2, 4, 8, 12, 16, 20, 24, 32, 48px)
- **Shadows**: Consistent elevation levels (sm, md, lg, xl)
- **Border Radius**: Rounded corners (4, 8, 12, 16, 20px, full circle)

## Architecture

### State Management
- Local state with React hooks
- WebSocket connection managed via custom hooks
- Persistent storage with AsyncStorage

### Communication
- WebSocket protocol for real-time communication
- Message streaming support
- Tool execution tracking
- Automatic reconnection

### Type Safety
- Full TypeScript coverage
- Strict type checking
- Comprehensive type definitions

## Features

### Phase 1: Core Chat (Tasks 4.1-4.8)
- Real-time messaging with Claude Code
- Message history and conversation management
- Tool execution visualization
- Connection status monitoring

### Phase 2: Advanced Features (Tasks 4.9-4.14)
- Slash commands (/help, /clear, /init, /git)
- File references with @ mentions
- Code syntax highlighting
- Settings and configuration

## Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building for Production

```bash
# Create production build
expo build:ios

# Create development build
expo build:ios --type simulator
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000/ws
```

### Server Connection

The app connects to a Claude Code server via WebSocket. Default configuration:
- **URL**: `ws://localhost:3000/ws`
- **Reconnect**: Automatic with exponential backoff
- **Ping Interval**: 30 seconds
- **Timeout**: 10 seconds

## Documentation

- [Technical Specification](docs/specs/claude-code-expo-v1.md)
- [Implementation Plan](docs/plans/2025-10-30-claude-code-mobile.md)
- [Phase 4 Frontend Tasks](docs/plans/phase-4-frontend-implementation.md)

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

Copyright © 2025 Anthropic. All rights reserved.

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.
