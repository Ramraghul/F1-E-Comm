import request from 'supertest';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { createAdmin } from '../../src/seed/factories';

const USERS_URL = '/api/v1/users';

describe('Admin user management guardrails', () => {
  it('blocks an admin from deactivating their own account', async () => {
    const admin = await createAdmin();

    const res = await request(app)
      .patch(`${USERS_URL}/${admin.id}`)
      .set('Authorization', bearer(admin))
      .send({ isActive: false });

    expect(res.status).toBe(400);

    const stillActive = await request(app)
      .get(`${USERS_URL}/${admin.id}`)
      .set('Authorization', bearer(admin));
    expect(stillActive.body.data.isActive).toBe(true);
  });

  it('blocks an admin from deleting their own account', async () => {
    const admin = await createAdmin();

    const res = await request(app)
      .delete(`${USERS_URL}/${admin.id}`)
      .set('Authorization', bearer(admin));

    expect(res.status).toBe(400);
  });

  it('blocks changing your own role', async () => {
    const admin = await createAdmin();

    const res = await request(app)
      .patch(`${USERS_URL}/${admin.id}`)
      .set('Authorization', bearer(admin))
      .send({ role: 'user' });

    expect(res.status).toBe(400);
  });

  it('allows one admin to deactivate a different admin', async () => {
    const admin = await createAdmin();
    const otherAdmin = await createAdmin();

    const res = await request(app)
      .patch(`${USERS_URL}/${otherAdmin.id}`)
      .set('Authorization', bearer(admin))
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('allows deleting a different admin when another admin remains', async () => {
    const admin = await createAdmin();
    const otherAdmin = await createAdmin();

    const res = await request(app)
      .delete(`${USERS_URL}/${otherAdmin.id}`)
      .set('Authorization', bearer(admin));

    expect(res.status).toBe(200);
  });
});
