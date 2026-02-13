import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase.js';
import { config } from '../config.js';

const USERS_COLLECTION = 'users';
const RESET_TOKENS_COLLECTION = 'resetTokens';

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
};

const STATUSES = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
};

class UsersStore {
  constructor() {
    this.seedSuperAdmin();
  }

  async seedSuperAdmin() {
    try {
      const email = (config.superAdminEmail || '').trim().toLowerCase();
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        console.log('✅ Super admin already exists');
        return;
      }

      const hashedPassword = await bcrypt.hash(config.superAdminPassword, 12);
      const userId = uuidv4();
      
      await db.collection(USERS_COLLECTION).doc(userId).set({
        id: userId,
        email,
        name: 'Hariprasanth',
        password: hashedPassword,
        role: ROLES.SUPER_ADMIN,
        status: STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Super admin user seeded to Firestore');
    } catch (error) {
      console.error('Error seeding super admin:', error);
    }
  }

  async createUser({ email, name, role = ROLES.USER, password = null }) {
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!normalizedEmail) throw new Error('Email is required');
      if (!name) throw new Error('Name is required');
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(normalizedEmail);
      if (existingUser) throw new Error('User with this email already exists');

      const hashedPassword = password ? await bcrypt.hash(password, 12) : await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);
      const userId = uuidv4();

      await db.collection(USERS_COLLECTION).doc(userId).set({
        id: userId,
        email: normalizedEmail,
        name,
        password: hashedPassword,
        role,
        status: STATUSES.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { id: userId, email: normalizedEmail, name, role, status: STATUSES.ACTIVE };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const snapshot = await db.collection(USERS_COLLECTION).where('email', '==', normalizedEmail).limit(1).get();
      if (snapshot.empty) return null;
      return snapshot.docs[0].data();
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const snapshot = await db.collection(USERS_COLLECTION).get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const { password, ...userWithoutPassword } = data;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async verifyPassword(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return null;
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return null;
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      await db.collection(USERS_COLLECTION).doc(userId).update({
        role: newRole,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async updateUserStatus(userId, status) {
    try {
      await db.collection(USERS_COLLECTION).doc(userId).update({
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async resetPassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.collection(USERS_COLLECTION).doc(userId).update({
        password: hashedPassword,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async generateRecoveryPassword(userId) {
    try {
      const recoveryPassword = crypto.randomBytes(8).toString('hex').toUpperCase();
      const hashedPassword = await bcrypt.hash(recoveryPassword, 12);
      
      await db.collection(USERS_COLLECTION).doc(userId).update({
        password: hashedPassword,
        updatedAt: new Date(),
      });

      return recoveryPassword;
    } catch (error) {
      console.error('Error generating recovery password:', error);
      throw error;
    }
  }

  async createResetToken(email, expiryMinutes = 15) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return null;

      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      const tokenId = uuidv4();
      await db.collection(RESET_TOKENS_COLLECTION).doc(tokenId).set({
        id: tokenId,
        userId: user.id,
        token: hashedToken,
        expiresAt,
        createdAt: new Date(),
      });

      return { token, userId: user.id };
    } catch (error) {
      console.error('Error creating reset token:', error);
      throw error;
    }
  }

  async verifyResetToken(token) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const snapshot = await db.collection(RESET_TOKENS_COLLECTION)
        .where('token', '==', hashedToken)
        .where('expiresAt', '>', new Date())
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      
      const tokenDoc = snapshot.docs[0];
      return { userId: tokenDoc.data().userId, tokenId: tokenDoc.id };
    } catch (error) {
      console.error('Error verifying reset token:', error);
      throw error;
    }
  }

  async deleteResetToken(tokenId) {
    try {
      await db.collection(RESET_TOKENS_COLLECTION).doc(tokenId).delete();
    } catch (error) {
      console.error('Error deleting reset token:', error);
      throw error;
    }
  }
}

export const usersStore = new UsersStore();
export const roles = ROLES;
export const statuses = STATUSES;

