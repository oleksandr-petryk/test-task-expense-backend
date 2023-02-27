import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

import {
  ChangePasswordDto,
  LogInDto,
  RegisterDto,
  UpdateSessionDto,
} from '@Module/auth/dto/auth.dto';
import { SessionService } from '@Module/auth/session.service';
import { TokensService } from '@Module/auth/tokens.service';
import { ExpenseCategoryService } from '@Module/expense-category/expense-category.service';
import { UserService } from '@Module/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly passwordSalt: number;

  constructor(
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
    private readonly sessionService: SessionService,
    private readonly expenseCategoryService: ExpenseCategoryService,
    private readonly configService: ConfigService,
  ) {
    this.passwordSalt = +this.configService.get('PASSWORD_SALT', {
      infer: true,
    });
  }

  async register(data: RegisterDto) {
    const checkEmailExists = await this.userService.findFirst({
      where: {
        email: data.email,
      },
    });

    if (checkEmailExists) {
      throw new BadRequestException('User with specified email already exists');
    }

    const checkUsernameExists = await this.userService.findFirst({
      where: {
        username: data.username,
      },
    });

    if (checkUsernameExists) {
      throw new BadRequestException(
        'User with specified username already exists',
      );
    }

    const passwordHash = bcryptjs.hashSync(data.password, this.passwordSalt);

    const newUser = await this.userService.create({
      data: {
        ...data,
        password: passwordHash,
      },
    });

    await this.expenseCategoryService.generateBaseCategoriesForUser(newUser.id);

    const otherExpenseCategory = await this.expenseCategoryService.findFirst({
      where: {
        userId: newUser.id,
        label: 'Other',
      },
    })

    await this.userService.update({
      where: { id: newUser.id },
      data: {
        otherExpenseCategoryId: otherExpenseCategory.id,
      },
    })
  }

  async logIn(data: LogInDto, deviceName: string) {
    const userCandidate = await this.userService.getExisting({
      where: {
        email: data.email,
      },
    });

    if (!bcryptjs.compareSync(data.password, userCandidate.password)) {
      throw new BadRequestException('Bad password');
    }

    const tokens = await this.tokensService.generatePairTokens({
      id: userCandidate.id,
    });

    await this.sessionService.create({
      data: {
        userId: userCandidate.id,
        deviceName,
        refreshToken: tokens.refreshToken,
      },
    });

    return tokens;
  }

  async logOut(refreshToken: string) {
    const candidate = await this.sessionService.getExisting({
      where: {
        refreshToken,
      },
    });

    await this.sessionService.delete({
      where: {
        id: candidate.id,
      },
    });
  }

  async refresh(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new BadRequestException('Bad refresh token');
    }

    const decoded = await this.tokensService.verifyRefreshToken(refreshToken);

    const tokenCandidate = await this.sessionService.findFirst({
      where: {
        refreshToken,
      },
    });

    if (!tokenCandidate) {
      throw new BadRequestException('Refresh token not exists');
    }

    const tokens = await this.tokensService.generatePairTokens({
      id: decoded.id,
    });

    await this.sessionService.update({
      where: {
        id: tokenCandidate.id,
      },
      data: {
        refreshToken: tokens.refreshToken,
      },
    });

    return tokens;
  }

  async getSessions(userId: string) {
    return this.sessionService.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        deviceName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteSessionById(userId: string, sessionId: string) {
    const candidate = await this.sessionService.getExisting({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (candidate.userId !== userId) {
      throw new BadRequestException('This session does not belong to you');
    }

    await this.sessionService.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async updateSession(sessionId: string, data: UpdateSessionDto) {
    return this.sessionService.updateExisting({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        deviceName: true,
        updatedAt: true,
        createdAt: true,
      },
      data,
    });
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    // Change password logic
    const userCandidate = await this.userService.getExisting({
      where: {
        id: userId,
      },
    });

    if (!bcryptjs.compareSync(data.oldPassword, userCandidate.password)) {
      throw new BadRequestException('Bad old password');
    }

    const newPasswordHash = bcryptjs.hashSync(
      data.newPassword,
      this.passwordSalt,
    );

    await this.userService.update({
      where: {
        id: userId,
      },
      data: {
        password: newPasswordHash,
      },
    });

    // Cancel all sessions
    await this.sessionService.deleteMany({
      where: {
        userId,
      },
    });
  }
}
