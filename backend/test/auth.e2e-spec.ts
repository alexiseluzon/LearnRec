import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // unique email per test run avoids collisions with leftover data
  const testEmail = `e2e-${Date.now()}@test.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // clean up the test user so re-runs stay idempotent
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('creates a new user and returns an access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: testEmail, password: testPassword, name: 'E2E Test' })
        .expect(201);

      const body = res.body as { accessToken: string };
      expect(body.accessToken).toBeDefined();
      expect(typeof body.accessToken).toBe('string');
    });

    it('rejects duplicate email with 409', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: testEmail, password: testPassword, name: 'E2E Test' })
        .expect(409);
    });

    it('rejects invalid email format with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'not-an-email', password: testPassword, name: 'Test' })
        .expect(400);
    });

    it('rejects short password with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: `short-${Date.now()}@test.com`,
          password: '123',
          name: 'Test',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('logs in with correct credentials and returns an access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const body = res.body as { accessToken: string };
      expect(body.accessToken).toBeDefined();
    });

    it('rejects wrong password with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: 'wrongpassword' })
        .expect(401);
    });

    it('rejects unknown email with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody-e2e@test.com', password: testPassword })
        .expect(401);
    });
  });

  describe('protected routes', () => {
    it('rejects /resources without a token', async () => {
      await request(app.getHttpServer()).get('/resources').expect(401);
    });

    it('allows /resources with a valid token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: testPassword });

      const body = loginRes.body as { accessToken: string };
      const token = body.accessToken;

      await request(app.getHttpServer())
        .get('/resources')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('rejects a malformed/invalid token with 401', async () => {
      await request(app.getHttpServer())
        .get('/resources')
        .set('Authorization', 'Bearer garbage-token')
        .expect(401);
    });
  });
});
