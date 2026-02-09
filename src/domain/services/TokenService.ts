export interface TokenPayload {
  userId: string;
  email: string;
  role?: 'customer' | 'retailer';
}

export interface TokenService {
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload | null;
}
