const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./models/User');
require('./models/Recipe');


const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


const app = express();

app.use(cors());
app.use(express.json());

// Test database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synced.');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
