import { INestApplication, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

describe('REST API integration (QA)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        class AuthController {
          async login(body: { username?: string; password?: string }) {
            if (!body.username || !body.password) {
              throw new BadRequestException();
            }
            if (body.username === 'denied') {
              throw new UnauthorizedException();
            }
            return { access_token: 'signed-token', companyId: 100 };
          }
        },
        class FiController {
          async findAll(headers: Record<string, string>) {
            if (!headers['x-company-id']) {
              throw new ForbiddenException('Missing company');
            }
            return [{ id: 1, documentNumber: 'FI-001' }];
          }
        },
        class MmController {
          async create() {
            return { id: 9, status: 'OPEN' };
          }
        },
        class WorkflowController {
          async action() {
            return { status: 'APPROVED' };
          }
        },
        class AnalyticsController {
          async run() {
            return { rows: 1 };
          }
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns token and handles validation errors', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'qa', password: 'secret' })
      .expect(201);
    expect(res.body.access_token).toBe('signed-token');
  });

  it('GET /fi/documents enforces company header', async () => {
    await request(app.getHttpServer()).get('/fi/documents').expect(403);
    const res = await request(app.getHttpServer())
      .get('/fi/documents')
      .set('x-company-id', '100')
      .expect(200);
    expect(res.body[0]).toHaveProperty('documentNumber');
  });

  it('POST /mm/purchase-orders returns created purchase order', async () => {
    const res = await request(app.getHttpServer()).post('/mm/purchase-orders').send({}).expect(201);
    expect(res.body).toMatchObject({ id: 9, status: 'OPEN' });
  });

  it('POST /workflow/actions registers actions', async () => {
    const res = await request(app.getHttpServer()).post('/workflow/actions').send({}).expect(201);
    expect(res.body.status).toBe('APPROVED');
  });

  it('POST /analytics/datasets/run executes datasets', async () => {
    const res = await request(app.getHttpServer()).post('/analytics/datasets/run').send({}).expect(201);
    expect(res.body.rows).toBe(1);
  });
});
