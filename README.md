# Tic Tac Toe - Real-time Multiplayer Game (Vibe Coded)

A production-ready real-time multiplayer Tic Tac Toe game with user authentication, game invitations, timer-based gameplay, and multi-game series tracking.

## 🎮 Features

- **User Authentication**: JWT-based authentication with instant account activation (no email verification)
- **Game Creation & Invitations**: Create games and invite opponents by username
- **Real-time Gameplay**: Socket.io powered real-time synchronization
- **Timer System**: 15-second countdown per move with auto-loss on timeout
- **Multi-Game Series**: Play best of 3, 5, or 7 game series
- **Turn Rotation**: Winner starts next game, tie alternates starting player
- **Series Tracking**: Complete series score tracking and winner determination
- **Beautiful UI**: Modern, responsive design with smooth animations

## 🛠️ Tech Stack

### Server
- **Node.js** with **TypeScript**
- **Express** for REST API
- **Socket.io** for real-time communication
- **MongoDB** with **Mongoose** for database
- **JWT** for authentication
- **bcrypt** for password hashing

### Client
- **Next.js 14** with **TypeScript**
- **React** for UI components
- **Socket.io-client** for real-time updates
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls

## 📁 Project Structure

```
tic-tac-toe/
├── server/          # Backend application
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Authentication middleware
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── socket/      # Socket.io handlers
│   │   ├── utils/       # Utility functions
│   │   └── server.ts    # Entry point
│   └── package.json
└── client/          # Frontend application
    ├── src/
    │   ├── app/         # Next.js pages
    │   ├── components/  # React components
    │   ├── contexts/    # React contexts
    │   ├── types/       # TypeScript types
    │   └── utils/       # Utility functions
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   cd tic-tac-toe
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   ```

3. **Configure server environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tic-tac-toe
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

4. **Set up the client**
   ```bash
   cd ../client
   npm install
   ```

5. **Configure client environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the server** (in `server/` directory)
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start the client** (in `client/` directory)
   ```bash
   npm run dev
   ```
   Client will run on `http://localhost:3000`

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Play

1. **Register an Account**
   - Provide email, username, full name, and password
   - Account is activated instantly (no verification needed)

2. **Create a Game**
   - Click "New Game" on the dashboard
   - Select series length (3, 5, or 7 games)
   - Enter opponent's username
   - Send invitation

3. **Accept Invitation**
   - Opponent receives real-time notification
   - Accept or decline the invitation

4. **Play the Game**
   - Each player has 15 seconds per move
   - Timer changes color: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
   - Auto-loss if timer expires
   - Win by getting 3 in a row (horizontal, vertical, or diagonal)

5. **Series Rules**
   - Winner of each game starts the next game
   - If game is a tie, the player who didn't start begins next game
   - Series winner is determined after all games complete

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Games
- `POST /api/games/create` - Create new game (protected)
- `POST /api/games/:gameId/accept` - Accept invitation (protected)
- `POST /api/games/:gameId/decline` - Decline invitation (protected)
- `GET /api/games/active` - Get active games (protected)
- `GET /api/games/invitations` - Get pending invitations (protected)
- `GET /api/games/:gameId` - Get game details (protected)

## 🔌 Socket.io Events

### Client to Server
- `game:join` - Join game room
- `game:start` - Start game
- `move:make` - Make a move
- `game:next` - Start next game in series

### Server to Client
- `game:created` - Invitation sent
- `game:joined` - Player joined room
- `game:started` - Game started
- `move:made` - Move synchronized
- `timer:tick` - Timer countdown
- `timer:expired` - Timer ran out
- `game:ended` - Game finished
- `series:completed` - Series finished
- `error` - Error occurred

## 🎨 UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Automatic dark mode support
- **Smooth Animations**: Framer Motion powered animations
- **Color-Coded Timer**: Visual feedback for time remaining
- **Winning Line Highlight**: Animated winning line display
- **Real-time Updates**: Instant synchronization between players

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **httpOnly Cookies**: Secure cookie storage
- **Password Hashing**: bcrypt password encryption
- **Server-side Validation**: All game logic validated on server
- **Protected Routes**: Authentication required for game access

## 📝 License

MIT License - feel free to use this project for learning or production!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Enjoy playing Tic Tac Toe!** 🎮✨
