import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import { CoreModule } from './core/core.module'
import { ms, type StringValue } from './shared/utils/ms.utils'
import { parseBoolean } from './shared/utils/parse-boolean'
import { RedisService } from './core/redis/redis.service'

async function bootstrap() {
	const app = await NestFactory.create(CoreModule)

	const config = app.get(ConfigService)
    const redis = app.get(RedisService)

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIn'),
		credentials: true,
		exposedHeaders: ['set-cookie']
	})

	app.use(
		session({
			secret: config.getOrThrow<string>('SESSION_SECRET'),
			name: config.getOrThrow<string>('SESSION_NAME'),
			resave: false,
			saveUninitialized: false,
			cookie: {
				domain: config.getOrThrow<string>('SESSION_DOMAIN'),
				maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
				httpOnly: parseBoolean(
					config.getOrThrow<StringValue>('SESSION_HTTP_ONLY')
				),
				secure: parseBoolean(
					config.getOrThrow<StringValue>('SESSION_SECURE')
				),
				sameSite: 'lax'
			},
			store:new RedisStore({
				client:redis,
				prefix: config.getOrThrow<string>('SESSION_FOLDER')
			})
		})
	)

	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
