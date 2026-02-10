import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'Hariprasanthtest@gmail.com',
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Inferno0!',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  tokenExpiry: process.env.TOKEN_EXPIRY || '12h',
  resetTokenExpiryMinutes: Number(process.env.RESET_TOKEN_EXPIRY_MINUTES || 15),
  exposeResetToken: process.env.EXPOSE_RESET_TOKEN === 'true',
  allowOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((o) => o.trim()),
};
