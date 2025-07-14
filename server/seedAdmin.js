import bcrypt from 'bcryptjs';
import models from './models/index.js';

const { User } = models;

export const createAdminUser = async () => {
  try {
    console.log('👨‍💼 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@chekawak.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    // Create admin user with enhanced security
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@chekawak.com',
      passwordHash,
      status: 'online',
      bio: 'System Administrator - Chekawak Messenger',
      phone: '+1-555-ADMIN',
      lastSeen: new Date()
    });

    console.log('✅ Admin user created successfully!');
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    // If user already exists due to constraint, try to find and return
    if (error.name === 'SequelizeUniqueConstraintError') {
      try {
        const existingUser = await User.findOne({
          where: { email: 'admin@chekawak.com' }
        });
        if (existingUser) {
          console.log('✅ Admin user found (constraint resolved)');
          return existingUser;
        }
      } catch (findError) {
        console.error('❌ Error finding existing admin:', findError);
      }
    }
    
    throw error;
  }
};

export const createDemoUsers = async () => {
  try {
    console.log('👥 Creating demo users...');
    
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
      },
      {
        username: 'sarah_connor',
        email: 'sarah@example.com',
        password: 'demo123',
        bio: 'Marketing Specialist',
        phone: '+1-555-0104'
      },
      {
        username: 'alex_tech',
        email: 'alex@example.com',
        password: 'demo123',
        bio: 'Full Stack Developer',
        phone: '+1-555-0105'
      }
    ];

    let createdCount = 0;
    
    for (const userData of demoUsers) {
      try {
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
            phone: userData.phone,
            lastSeen: new Date()
          });
          console.log(`✅ Demo user created: ${userData.username}`);
          createdCount++;
        }
      } catch (userError) {
        if (userError.name === 'SequelizeUniqueConstraintError') {
          console.log(`⚠️  Demo user ${userData.username} already exists`);
        } else {
          console.error(`❌ Error creating demo user ${userData.username}:`, userError);
        }
      }
    }
    
    console.log(`✅ Demo users setup complete (${createdCount} new users created)`);
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  }
};

// Additional utility function to reset all users
export const resetUsers = async () => {
  try {
    console.log('🔄 Resetting all users...');
    await User.destroy({ where: {}, force: true });
    console.log('✅ All users reset');
    
    // Recreate admin and demo users
    await createAdminUser();
    await createDemoUsers();
  } catch (error) {
    console.error('❌ Error resetting users:', error);
    throw error;
  }
};