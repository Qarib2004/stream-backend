import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import type { Request } from 'express'

import { TokenType, User } from '@/generated/prisma'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { generateToken } from '@/src/shared/utils/generate-token.utils'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.utils'
import { saveSession } from '@/src/shared/utils/session.util'

import { MailService } from '../../libs/mail/mail.service'

import { VerificationInput } from './inputs/verification.input'

@Injectable()
export class VerificationService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService
	) {}

	public async verify(
		req: Request,
		input: VerificationInput,
		userAgent: string
	) {
		const { token } = input

		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.EMAIL_VERIFY
			}
		})

		if (!existingToken) {
			throw new NotFoundException('Token not found')
		}

		const hasExpired = new Date(existingToken.expiresIn) < new Date()

		if (hasExpired) {
			throw new BadRequestException('Token expired')
		}

		if (!existingToken.userId) {
			throw new BadRequestException('Token is not linked to a user')
		}

		const user = await this.prismaService.user.update({
			where: {
				id: existingToken.userId
			},

			data: {
				isEmailVerified: true
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.EMAIL_VERIFY
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata)
	}

	public async sendVerificationToken(user: User) {
		await generateToken(
			this.prismaService,
			user,
			TokenType.EMAIL_VERIFY,
			true
		)

		return true
	}
}
