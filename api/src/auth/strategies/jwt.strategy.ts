/**
 * jwt.strategy.ts — Tells Passport how to validate a JWT access token
 *
 * When a protected route is hit, this strategy:
 *   1. Extracts the Bearer token from the Authorization header
 *   2. Verifies its signature using JWT_ACCESS_SECRET
 *   3. Returns the decoded payload (userId + email) which NestJS attaches to req.user
 *
 * If the token is missing, expired, or tampered with — the request is rejected
 * with a 401 Unauthorized response automatically.
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Look for the token in the "Authorization: Bearer <token>" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject tokens that have passed their expiry time
      ignoreExpiration: false,
      // The secret key used to verify the token's signature
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Called after the token is verified.
   * The payload contains what we put in when we signed the token (sub = userId).
   * Whatever we return here becomes req.user in the controller.
   */
  validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
