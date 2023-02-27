import { ApiProperty } from '@nestjs/swagger';
import Prisma from '@prisma/client';

export class UserDto implements Omit<Prisma.User, 'password'> {
  @ApiProperty({
    description: 'User ID',
    type: 'string',
  })
  readonly id: string;

  @ApiProperty({
    description: 'User email',
    type: 'string',
  })
  readonly email: string;

  @ApiProperty({
    description: 'Username',
    type: 'string',
  })
  readonly username: string;

  @ApiProperty({
    description: 'User display name',
    type: 'string',
  })
  readonly displayName: string | null;

  @ApiProperty({
    description: 'User role',
    enum: ['user', 'admin'],
  })
  readonly role: Prisma.UserRole;

  @ApiProperty({
    description: 'Other expense category ID',
    type: 'string',
    example: '5265d8da-f010-47b3-b9a7-aa5bf3b6ee42',
  })
  otherExpenseCategoryId: string;

  @ApiProperty({
    description: 'The date the user was created',
    type: 'string',
  })
  readonly createdAt: Date;

  @ApiProperty({
    description: 'The date the user was updated',
    type: 'string',
  })
  readonly updatedAt: Date;
}
