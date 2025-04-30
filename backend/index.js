require('dotenv').config();
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

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;

    console.log('projectId', projectId);
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new customError('Invalid project id', 400));
    }

    socket.project = await Project.findById(projectId);

    if (!token) {
      return next(new customError('Authentication error: Token missing', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return next(new customError('User not found', 401));
    }

    console.log('Authenticated user:', user.userName);
    socket.userId = user.id;
    socket.userName = user.userName; 
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
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
    console.log('Received message:', data);
    const message=data.message

    

    const aiIsPresentInMessage=message.includes('@ai');
    socket.broadcast.to(socket.project._id.toString()).emit('project-message', data);

    if (aiIsPresentInMessage) {
      const prompt = message.replace('@ai', '');
      const result = await genrateResult(prompt);
      console.log('AI result:', result);

      io.to(socket.project._id.toString()).emit('project-message', {
          message: result,
          sender: {
              _id: 'ai',
              email: 'AI',
              userName: 'AI',
          }
      });

      return;
  }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.userId);
    socket.leave(socket.project._id.toString());
  });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


