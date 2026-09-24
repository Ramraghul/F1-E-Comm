import request from 'supertest';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { createTeam, createAdmin, createUser, createProduct } from '../../src/seed/factories';

describe('Reviews', () => {
  it('rejects a second review by the same user on the same product with 409', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const user = await createUser();
    const product = await createProduct(team.id, admin.id);

    const url = `/api/v1/products/${product.id}/reviews`;
    await request(app)
      .post(url)
      .set('Authorization', bearer(user))
      .send({ rating: 5, comment: 'Great product, fast shipping!' })
      .expect(201);

    const res = await request(app)
      .post(url)
      .set('Authorization', bearer(user))
      .send({ rating: 4, comment: 'Trying again' });
    expect(res.status).toBe(409);
  });

  it('lets the owner delete their own review, but not another user', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const owner = await createUser();
    const stranger = await createUser();
    const product = await createProduct(team.id, admin.id);

    const createRes = await request(app)
      .post(`/api/v1/products/${product.id}/reviews`)
      .set('Authorization', bearer(owner))
      .send({ rating: 5, comment: 'Loved it!' });
    const reviewId = createRes.body.data.id;

    const blockedRes = await request(app)
      .delete(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', bearer(stranger));
    expect(blockedRes.status).toBe(403);

    const okRes = await request(app)
      .delete(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', bearer(owner));
    expect(okRes.status).toBe(200);
  });

  it('lets an admin delete any review', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const owner = await createUser();
    const product = await createProduct(team.id, admin.id);

    const createRes = await request(app)
      .post(`/api/v1/products/${product.id}/reviews`)
      .set('Authorization', bearer(owner))
      .send({ rating: 3, comment: 'It was okay.' });
    const reviewId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', bearer(admin));
    expect(res.status).toBe(200);
  });
});
