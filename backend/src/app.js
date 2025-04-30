const express = require('express');
const app = express();
const morgan = require('morgan');
const userRoutes = require('../src/routes/userRoutes/user.routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const projectRoutes = require('../src/routes/projectRoutes/project.routes');
const aiRoutes = require('../src/routes/aiRoutes/ai.routes');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cookieParser()); 



app.use('/api/auth', userRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;