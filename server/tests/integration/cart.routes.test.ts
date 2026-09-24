import request from 'supertest';
import { app } from '../utils/testApp';
import { bearer } from '../utils/auth';
import { createTeam, createAdmin, createUser, createProduct } from '../../src/seed/factories';

const CART_URL = '/api/v1/cart';

describe('Cart', () => {
  it('adding the same product twice increments quantity instead of creating a duplicate line', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { stock: 10 });

    await request(app)
      .post(`${CART_URL}/items`)
      .set('Authorization', bearer(buyer))
      .send({ productId: product.id, quantity: 2 })
      .expect(200);

    const res = await request(app)
      .post(`${CART_URL}/items`)
      .set('Authorization', bearer(buyer))
      .send({ productId: product.id, quantity: 3 })
      .expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(5);
  });

  it('rejects adding more than available stock with 409', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { stock: 2 });

    const res = await request(app)
      .post(`${CART_URL}/items`)
      .set('Authorization', bearer(buyer))
      .send({ productId: product.id, quantity: 3 });

    expect(res.status).toBe(409);
  });

  it('removing an item deletes its line from the cart', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { stock: 10 });

    await request(app)
      .post(`${CART_URL}/items`)
      .set('Authorization', bearer(buyer))
      .send({ productId: product.id, quantity: 1 });

    const res = await request(app)
      .delete(`${CART_URL}/items/${product.id}`)
      .set('Authorization', bearer(buyer));

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });

  it('merges a guest cart into the server cart, clamped by live stock', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const productA = await createProduct(team.id, admin.id, { stock: 5 });
    const productB = await createProduct(team.id, admin.id, { stock: 1 });

    const res = await request(app)
      .post(`${CART_URL}/merge`)
      .set('Authorization', bearer(buyer))
      .send({
        items: [
          { productId: productA.id, quantity: 3 },
          { productId: productB.id, quantity: 5 }, // exceeds stock of 1
        ],
      });

    expect(res.status).toBe(200);
    const items = res.body.data.items as { product: { id: string }; quantity: number }[];
    const lineA = items.find((i) => i.product.id === productA.id);
    const lineB = items.find((i) => i.product.id === productB.id);
    expect(lineA!.quantity).toBe(3);
    expect(lineB!.quantity).toBe(1); // clamped to available stock
  });

  it('clears the cart', async () => {
    const team = await createTeam();
    const admin = await createAdmin();
    const buyer = await createUser();
    const product = await createProduct(team.id, admin.id, { stock: 10 });

    await request(app)
      .post(`${CART_URL}/items`)
      .set('Authorization', bearer(buyer))
      .send({ productId: product.id, quantity: 1 });

    const res = await request(app).delete(CART_URL).set('Authorization', bearer(buyer));
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
  });
});
