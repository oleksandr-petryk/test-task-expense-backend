import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  id: string;
}

export interface JwtTokensPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Tokens service
 */
@Injectable()
export class TokensService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.accessTokenSecret = this.configService.get('JWT_ACCESS_SECRET', {
      infer: true,
    });
    this.refreshTokenSecret = this.configService.get('JWT_ACCESS_SECRET', {
      infer: true,
    });
    this.accessTokenExpiresIn = this.configService.get(
      'JWT_ACCESS_EXPIRES_IN',
      { infer: true },
    );
    this.refreshTokenExpiresIn = this.configService.get(
      'JWT_REFRESH_EXPIRES_IN',
      { infer: true },
    );
  }

  async generateAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  async generateRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  async generatePairTokens(payload: JwtPayload) {
    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
    };
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.refreshTokenSecret,
    });
  }
}
