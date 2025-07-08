const express = require('express');
const app = express();
const morgan = require('morgan');
const userRoutes = require('../src/routes/userRoutes/user.routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const projectRoutes = require('../src/routes/projectRoutes/project.routes');
const aiRoutes = require('../src/routes/aiRoutes/ai.routes');
const session = require('express-session');
const messageRoutes = require('./routes/messageRoutes/message.routes');




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('tiny'));
app.use(cookieParser()); 
app.use(cors({
 origin: [
    'https://codev-lpk6.onrender.com', 
    'http://localhost:5173'            
  ],
  credentials: true, 
}));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    sameSite: 'lax' // or 'none' if cross-site
  }
}));



app.use('/api/auth', userRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages',messageRoutes);


module.exports = app;