const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
require('./passport-config');

const app = express();
const consularFileRoutes = require('./routes/consularFile');
const registrationRoutes = require('./routes/registration');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');

app.use(passport.initialize());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploads

app.use('/api/consular-files', consularFileRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;