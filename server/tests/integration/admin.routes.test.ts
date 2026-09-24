import request from 'supertest';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { createTeam, createAdmin, createUser, createRaceTeamUser } from '../../src/seed/factories';

describe('Admin', () => {
  it('rejects non-admin access to analytics with 403', async () => {
    const user = await createUser();
    const res = await request(app)
      .get('/api/v1/admin/analytics/overview')
      .set('Authorization', bearer(user));
    expect(res.status).toBe(403);
  });

  it('lists pending Race Team applications and lets an admin approve one', async () => {
    const admin = await createAdmin();
    const team = await createTeam();
    const pending = await createRaceTeamUser(team.id, { isApproved: false });

    const listRes = await request(app)
      .get('/api/v1/admin/raceteams/pending')
      .set('Authorization', bearer(admin));
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((u: { id: string }) => u.id === pending.id)).toBe(true);

    const approveRes = await request(app)
      .patch(`/api/v1/admin/raceteams/${pending.id}/approve`)
      .set('Authorization', bearer(admin));
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.isApproved).toBe(true);
  });

  it('returns a well-formed overview analytics payload for an admin', async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .get('/api/v1/admin/analytics/overview')
      .set('Authorization', bearer(admin));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(
      expect.objectContaining({
        totalRevenue: expect.any(Number),
        totalOrders: expect.any(Number),
        totalUsers: expect.any(Number),
        totalRaceTeams: expect.any(Number),
        pendingRaceTeamApprovals: expect.any(Number),
      }),
    );
  });
});
