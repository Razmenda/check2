import bcrypt from 'bcryptjs';
import models from './models/index.js';

const { User } = models;

export const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@chekawak.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@chekawak.com',
      passwordHash,
      status: 'online',
      bio: 'System Administrator - Chekawak Messenger',
      phone: '+1-555-ADMIN'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@chekawak.com');
    console.log('🔑 Password: admin123');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Create some demo users for testing
export const createDemoUsers = async () => {
  try {
    const demoUsers = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'demo123',
        bio: 'Software Developer at Tech Corp',
        phone: '+1-555-0101'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'demo123',
        bio: 'UI/UX Designer',
        phone: '+1-555-0102'
      },
      {
        username: 'mike_wilson',
        email: 'mike@example.com',
        password: 'demo123',
        bio: 'Product Manager',
        phone: '+1-555-0103'
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        await User.create({
          username: userData.username,
          email: userData.email,
          passwordHash,
          status: Math.random() > 0.5 ? 'online' : 'offline',
          bio: userData.bio,
          phone: userData.phone
        });
        console.log(`✅ Demo user created: ${userData.username}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  }
};