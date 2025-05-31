require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password123'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    const createdUsers = await User.insertMany(users);
    console.log('Added users:', createdUsers.map(user => ({
      name: user.name,
      email: user.email
    })));

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers(); 