import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: String,
}, { timestamps: true });

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dh-financial';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', UserSchema);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dhfinancial.com';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log('Admin user already exists');
  } else {
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123',
      12,
    );

    await User.create({
      name: process.env.ADMIN_NAME || 'DH Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
