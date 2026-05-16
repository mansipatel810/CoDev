require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const app=require('./src/app.js');
const http = require('http');
const connectDB = require('./src/config/db.config.js');
const jwt=require('jsonwebtoken');
const customError = require('./src/utils/customError.js');
connectDB();
const mongoose = require('mongoose');
const Project=require('./src/models/projectModel/project.model.js');
const User=require('./src/models/userModel/user.model.js');
const {genrateResult}=require('./src/services/ai.service.js');
const Message=require('./src/models/messageModel/message.model.js');
const path = require('path');
const express = require('express');


// const __dirname= path.resolve();

const server = http.createServer(app);
const FRONTEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://codev-lpk6.onrender.com'
  : 'http://localhost:5173';

const io = require('socket.io')(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;

    // 1. Validate token FIRST (cheap, no DB hit)
    if (!token) {
      return next(new customError('Authentication error: Token missing', 401));
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return next(new customError('Authentication error: Invalid token', 401));
    }

    // 2. Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new customError('Invalid project id', 400));
    }

    // 3. DB queries (now we know credentials are at least syntactically valid)
    const [project, user] = await Promise.all([
      Project.findById(projectId),
      User.findOne({ email: decoded.email }),
    ]);

    if (!project) {
      return next(new customError('Project not found', 404));
    }
    if (!user) {
      return next(new customError('User not found', 401));
    }

    socket.project  = project;
    socket.userId   = user.id;
    socket.userName = user.userName;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.name, '-', error.message);
    return next(new customError('Authentication error', 401));
  }
});

io.on('connection', (socket) => {
  console.log('New socket client connected');
  // console.log('User ID:', socket.userId);
  // console.log('User Name:', socket.userName);
  // console.log('Project ID:', socket.project._id.toString());

  socket.join(socket.project._id.toString());

  socket.on('project-message', async (data) => {
    try {
      const message = data.message;
      const aiIsPresentInMessage = message.includes('@ai');

      // Broadcast to everyone else in the room immediately
      socket.broadcast.to(socket.project._id.toString()).emit('project-message', data);

      // Persist the user's message
      await Message.create({
        project: socket.project._id,
        sender:  socket.userId,
        message: data.message,
      });

      if (aiIsPresentInMessage) {
        const prompt = message.replace('@ai', '').trim();

        // Let everyone know AI is thinking
        io.to(socket.project._id.toString()).emit('ai-thinking', { thinking: true });

        let result;
        try {
          result = await genrateResult(prompt);
        } catch (aiErr) {
          console.error('AI generation error:', aiErr.message);
          io.to(socket.project._id.toString()).emit('ai-thinking', { thinking: false });
          io.to(socket.project._id.toString()).emit('project-message', {
            message: JSON.stringify({ text: `AI error: ${aiErr.message}` }),
            sender: { _id: 'ai', email: 'AI', userName: 'AI' },
          });
          return;
        }

        io.to(socket.project._id.toString()).emit('ai-thinking', { thinking: false });
        io.to(socket.project._id.toString()).emit('project-message', {
          message: result,
          sender: { _id: 'ai', email: 'AI', userName: 'AI' },
        });

        // Persist AI response too
        await Message.create({
          project: socket.project._id,
          sender:  null,
          message: result,
        });
      }
    } catch (err) {
      console.error('project-message handler error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    // console.log('Socket disconnected:', socket.userId);
    socket.leave(socket.project._id.toString());
  });
});

const PORT = process.env.PORT || 3000;

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Backend running in development mode.');
  });

  app.get('*', (req, res) => {
    res.status(404).send('API route not found.');
  });
}



server.listen(PORT, '0.0.0.0',() => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


