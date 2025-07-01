# Chekawak Messenger

A complete, production-ready real-time messaging application with video calling capabilities, built with React, Node.js, Socket.IO, and SQLite.

## Features

- **Real-time Messaging**: Instant message delivery with Socket.IO
- **Video & Audio Calls**: WebRTC-powered voice and video calling
- **User Authentication**: Secure JWT-based authentication
- **Persistent Storage**: SQLite database with Sequelize ORM
- **File Sharing**: Support for images, files, and audio messages
- **Online Status**: Real-time user presence indicators
- **Typing Indicators**: See when others are typing
- **Group Chats**: Create and manage group conversations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Socket.IO
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.IO for messaging and WebRTC for calls
- **File Storage**: Local file system

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chekawak-messenger
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
DB_PATH=./database.sqlite
NODE_ENV=development
```

5. Start the application:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Deployment on Replit

1. Create a new Replit project
2. Upload all project files
3. Set environment variables in Replit's Secrets tab:
   - `JWT_SECRET`: A secure random string
   - `PORT`: 5000 (or leave default)
   - `NODE_ENV`: production

4. Click the "Run" button

The `.replit` file is already configured to start the application automatically.

## Project Structure

```
├── server/                 # Backend code
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── socket/            # Socket.IO handlers
│   └── index.js           # Server entry point
├── src/                   # Frontend code
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── screens/           # Main screens
│   └── App.tsx            # App entry point
├── uploads/               # File uploads directory
├── database.sqlite        # SQLite database file
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users?search=query` - Search users

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details

### Messages
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages/:chatId` - Send message
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message

### Calls
- `POST /api/calls` - Initiate call
- `GET /api/calls/:id` - Get call details
- `PUT /api/calls/:id` - Update call status

## Socket.IO Events

### Client to Server
- `send_message` - Send a new message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `call_invite` - Invite to call
- `call_answer` - Answer call
- `call_reject` - Reject call
- `call_end` - End call
- `webrtc_offer` - WebRTC offer
- `webrtc_answer` - WebRTC answer
- `webrtc_ice_candidate` - ICE candidate

### Server to Client
- `new_message` - New message received
- `typing_started` - User started typing
- `typing_stopped` - User stopped typing
- `user_status_changed` - User online status changed
- `call_invite` - Incoming call invitation
- `call_answered` - Call was answered
- `call_rejected` - Call was rejected
- `call_ended` - Call was ended
- `webrtc_offer` - WebRTC offer received
- `webrtc_answer` - WebRTC answer received
- `webrtc_ice_candidate` - ICE candidate received

## Database Schema

### Users
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `passwordHash` - Hashed password
- `status` - Online status (online/offline/away)
- `avatar` - Profile picture URL
- `lastSeen` - Last activity timestamp

### Chats
- `id` - Primary key
- `name` - Chat name (for groups)
- `isGroup` - Boolean flag for group chats
- `avatar` - Chat avatar URL
- `createdBy` - Creator user ID

### Messages
- `id` - Primary key
- `chatId` - Foreign key to Chat
- `senderId` - Foreign key to User
- `content` - Message content
- `type` - Message type (text/image/file/audio)
- `fileName` - Original file name
- `fileSize` - File size in bytes
- `isEdited` - Edit flag
- `editedAt` - Edit timestamp

### Calls
- `id` - Primary key
- `chatId` - Foreign key to Chat
- `initiatorId` - Foreign key to User
- `participants` - JSON array of participant IDs
- `status` - Call status (pending/ongoing/ended/missed)
- `type` - Call type (audio/video)
- `startedAt` - Call start time
- `endedAt` - Call end time
- `duration` - Call duration in seconds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.