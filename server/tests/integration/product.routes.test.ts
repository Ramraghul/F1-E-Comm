import request from 'supertest';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { createTeam, createUser, createAdmin, createRaceTeamUser, createProduct } from '../../src/seed/factories';

const PRODUCTS_URL = '/api/v1/products';

function validProductPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'Team Cap',
    description: 'An officially licensed team cap for race day.',
    category: 'headwear',
    price: 3499,
    stock: 50,
    sku: `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    images: ['https://example.com/cap.jpg'],
    ...overrides,
  };
}

describe('Products RBAC', () => {
  it('rejects an unauthenticated create with 401', async () => {
    const res = await request(app).post(PRODUCTS_URL).send(validProductPayload());
    expect(res.status).toBe(401);
  });

  it('rejects a plain "user" role create with 403', async () => {
    const user = await createUser();
    const res = await request(app)
      .post(PRODUCTS_URL)
      .set('Authorization', bearer(user))
      .send(validProductPayload());
    expect(res.status).toBe(403);
  });

  it('lets a raceteam create a product, always scoped to their own team', async () => {
    const team = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);

    const otherTeam = await createTeam();
    const res = await request(app)
      .post(PRODUCTS_URL)
      .set('Authorization', bearer(raceteam))
      .send(validProductPayload({ team: otherTeam.id })); // spoof attempt — must be ignored

    expect(res.status).toBe(201);
    expect(res.body.data.team).toBe(team.id);
  });

  it('blocks a raceteam from editing another team\'s product (403)', async () => {
    const teamA = await createTeam();
    const teamB = await createTeam();
    const raceteamA = await createRaceTeamUser(teamA.id);
    const adminUser = await createAdmin();
    const productOfB = await createProduct(teamB.id, adminUser.id);

    const res = await request(app)
      .patch(`${PRODUCTS_URL}/${productOfB.id}`)
      .set('Authorization', bearer(raceteamA))
      .send({ price: 9999 });

    expect(res.status).toBe(403);
  });

  it('lets a raceteam edit their own team\'s product (200)', async () => {
    const team = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);
    const product = await createProduct(team.id, raceteam.id);

    const res = await request(app)
      .patch(`${PRODUCTS_URL}/${product.id}`)
      .set('Authorization', bearer(raceteam))
      .send({ price: 4200 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(4200);
  });

  it('lets an admin edit any team\'s product (200)', async () => {
    const team = await createTeam();
    const raceteam = await createRaceTeamUser(team.id);
    const admin = await createAdmin();
    const product = await createProduct(team.id, raceteam.id);

    const res = await request(app)
      .patch(`${PRODUCTS_URL}/${product.id}`)
      .set('Authorization', bearer(admin))
      .send({ price: 5150 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(5150);
  });
});

describe('Products listing', () => {
  it('filters by team slug and category, and paginates', async () => {
    const teamA = await createTeam({ slug: 'team-a' });
    const teamB = await createTeam({ slug: 'team-b' });
    const admin = await createAdmin();

    await Promise.all([
      createProduct(teamA.id, admin.id, { category: 'apparel' }),
      createProduct(teamA.id, admin.id, { category: 'headwear' }),
      createProduct(teamB.id, admin.id, { category: 'apparel' }),
    ]);

    const res = await request(app).get(PRODUCTS_URL).query({ team: 'team-a' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });
});
