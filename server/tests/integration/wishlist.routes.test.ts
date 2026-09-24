import request from 'supertest';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { createTeam, createAdmin, createUser, createProduct } from '../../src/seed/factories';

const WISHLIST_URL = '/api/v1/wishlist';

describe('Wishlist', () => {
  it('returns 401 for an unauthenticated request', async () => {
    const res = await request(app).get(WISHLIST_URL);
    expect(res.status).toBe(401);
  });

  it('starts empty for a new user', async () => {
    const buyer = await createUser();
    const res = await request(app).get(WISHLIST_URL).set('Authorization', bearer(buyer));
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it('adds a product to the wishlist', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id);

    const res = await request(app)
      .post(`${WISHLIST_URL}/${product.id}`)
      .set('Authorization', bearer(buyer));

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].product.id).toBe(product.id);
  });

  it('adding the same product twice is idempotent (no duplicate line)', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id);

    await request(app).post(`${WISHLIST_URL}/${product.id}`).set('Authorization', bearer(buyer));
    const res = await request(app)
      .post(`${WISHLIST_URL}/${product.id}`)
      .set('Authorization', bearer(buyer));

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('returns 404 when adding a product that does not exist', async () => {
    const buyer = await createUser();
    const res = await request(app)
      .post(`${WISHLIST_URL}/507f1f77bcf86cd799439011`)
      .set('Authorization', bearer(buyer));
    expect(res.status).toBe(404);
  });

  it('removes a product from the wishlist', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id);

    await request(app).post(`${WISHLIST_URL}/${product.id}`).set('Authorization', bearer(buyer));
    const res = await request(app)
      .delete(`${WISHLIST_URL}/${product.id}`)
      .set('Authorization', bearer(buyer));

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it('removing a product not on the wishlist is a harmless no-op', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id);

    const res = await request(app)
      .delete(`${WISHLIST_URL}/${product.id}`)
      .set('Authorization', bearer(buyer));

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it('keeps each user\'s wishlist separate', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyerA = await createUser();
    const buyerB = await createUser();
    const product = await createProduct(team.id, admin.id);

    await request(app).post(`${WISHLIST_URL}/${product.id}`).set('Authorization', bearer(buyerA));
    const resB = await request(app).get(WISHLIST_URL).set('Authorization', bearer(buyerB));

    expect(resB.body.data.items).toHaveLength(0);
  });
});
