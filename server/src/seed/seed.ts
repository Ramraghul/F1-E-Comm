import 'dotenv/config';
import { Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import {
  ROLES,
  ORDER_STATUS,
  OFFER_SCOPE,
  OFFER_DISCOUNT_TYPE,
  TEAM_SEED_DATA,
  type OrderStatus,
  type ProductCategory,
} from '@shopswift/shared';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User.model';
import { Team } from '../models/Team.model';
import { Product } from '../models/Product.model';
import { Offer } from '../models/Offer.model';
import { Order } from '../models/Order.model';
import { Review } from '../models/Review.model';
import { logger } from '../utils/logger';
import { generateOrderNumber, slugify } from '../utils/slugify';
import { generateProductImage } from '../utils/productImage';
import { createUser, createRaceTeamUser, createOffer } from './factories';
import {
  PRODUCT_CATALOG,
  DRIVER_PRODUCT_TEMPLATES,
  TEAM_SHORT_NAME,
  driverProductName,
} from './data/productCatalog';

const CUSTOMER_COUNT = 30;
const DEMO_ORDER_COUNT = 40;

interface ProductSeedDoc {
  team: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  sku: string;
  images: string[];
  sizes?: string[];
  driverTag?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdBy: Types.ObjectId;
}

async function main() {
  const forced = process.argv.includes('--force');
  if (env.NODE_ENV === 'production' && !forced) {
    throw new Error('Refusing to seed a production database without --force');
  }

  await connectDB();
  logger.info('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Product.deleteMany({}),
    Offer.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);

  logger.info('Seeding teams...');
  const teams = await Team.create(TEAM_SEED_DATA);

  logger.info('Seeding admin...');
  const admin = await User.create({
    name: 'Shop Swift Admin',
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: ROLES.ADMIN,
  });

  logger.info('Seeding one approved Race Team account per team...');
  const raceTeamUsers = await Promise.all(
    teams.map((team) =>
      createRaceTeamUser(team.id, {
        name: `${team.name} Store Manager`,
        email: `raceteam+${team.slug}@shopswift.dev`,
        password: env.SEED_RACETEAM_PASSWORD,
        isApproved: true,
      }),
    ),
  );

  logger.info('Seeding one pending Race Team application (for the admin approval demo)...');
  const pendingRaceTeamTeam = await Team.create({
    name: 'Apex Motorsport (Demo Applicant)',
    slug: 'apex-motorsport-demo',
    nationality: 'British',
    colorPrimary: '#111111',
    colorSecondary: '#EEEEEE',
    colorAccent: '#E10600',
    foundedYear: 2024,
    // Not a real grid team — only exists to demo the approval workflow, so it's
    // hidden from public browsing (public `GET /teams` filters isActive:true).
    isActive: false,
  });
  await createRaceTeamUser(pendingRaceTeamTeam.id, {
    name: 'Apex Motorsport Applicant',
    email: 'raceteam+pending@shopswift.dev',
    password: env.SEED_RACETEAM_PASSWORD,
    isApproved: false,
  });

  logger.info(`Seeding a demo customer + ${CUSTOMER_COUNT - 1} random customers...`);
  const demoCustomer = await createUser({
    name: 'Demo Customer',
    email: 'customer@shopswift.dev',
    password: env.SEED_CUSTOMER_PASSWORD,
  });
  const otherCustomers = await Promise.all(
    Array.from({ length: CUSTOMER_COUNT - 1 }, () => createUser()),
  );
  const customers = [demoCustomer, ...otherCustomers];

  logger.info('Seeding a realistic F1 merchandise catalog for every team...');
  const productsByTeam = new Map<string, Awaited<ReturnType<typeof Product.insertMany>>>();
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i]!;
    const owner = raceTeamUsers[i]!;
    const shortName = TEAM_SHORT_NAME[team.slug] ?? team.name;
    let sequence = 1;

    const docs: ProductSeedDoc[] = [];

    for (const template of PRODUCT_CATALOG) {
      const name = template.name.replace('{team}', shortName);
      const [min, max] = template.priceRange;
      const lowStock = faker.datatype.boolean({ probability: 0.12 });
      docs.push({
        team: team._id,
        name,
        slug: slugify(`${name}-${sequence}`),
        description: template.description,
        category: template.category,
        price: faker.number.int({ min, max }) * 100,
        stock: lowStock ? faker.number.int({ min: 1, max: 5 }) : faker.number.int({ min: 15, max: 150 }),
        sku: `${team.slug.toUpperCase()}-${String(sequence++).padStart(3, '0')}`,
        images: [generateProductImage(template.category, team.colorPrimary, name)],
        sizes: template.sizes,
        isFeatured: !!template.isFeaturedCandidate && faker.datatype.boolean({ probability: 0.5 }),
        isActive: true,
        createdBy: owner._id,
      });
    }

    for (const driver of team.drivers) {
      for (const template of DRIVER_PRODUCT_TEMPLATES) {
        const name = driverProductName(driver.name, template);
        const [min, max] = template.priceRange;
        docs.push({
          team: team._id,
          name,
          slug: slugify(`${name}-${sequence}`),
          description: template.description,
          category: template.category,
          price: faker.number.int({ min, max }) * 100,
          stock: faker.number.int({ min: 10, max: 80 }),
          sku: `${team.slug.toUpperCase()}-${String(sequence++).padStart(3, '0')}`,
          images: [generateProductImage(template.category, team.colorPrimary, name)],
          driverTag: driver.name,
          isFeatured: false,
          isActive: true,
          createdBy: owner._id,
        });
      }
    }

    const products = await Product.insertMany(docs);
    productsByTeam.set(team.id, products);
  }
  const allProducts = [...productsByTeam.values()].flat();

  logger.info('Seeding offers (global admin coupons + per-team offers)...');
  await createOffer(admin.id, ROLES.ADMIN, {
    code: 'WELCOME10',
    description: '10% off your first order, sitewide',
    discountType: OFFER_DISCOUNT_TYPE.PERCENT,
    discountValue: 10,
    scope: OFFER_SCOPE.GLOBAL,
    minOrderValue: 0,
    usageLimitPerUser: 1,
    startsAt: faker.date.recent({ days: 10 }),
    expiresAt: faker.date.soon({ days: 60 }),
  });
  await createOffer(admin.id, ROLES.ADMIN, {
    code: 'PITSTOP25',
    description: '$25 off orders over $150 (flash sale)',
    discountType: OFFER_DISCOUNT_TYPE.FLAT,
    discountValue: 2500,
    scope: OFFER_SCOPE.GLOBAL,
    minOrderValue: 15000,
    usageLimit: 100,
    tag: 'flash-sale',
    startsAt: faker.date.recent({ days: 2 }),
    expiresAt: faker.date.soon({ days: 7 }),
  });

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i]!;
    const owner = raceTeamUsers[i]!;
    await createOffer(owner.id, ROLES.RACETEAM, {
      code: `${team.slug.toUpperCase().replace(/-/g, '').slice(0, 10)}15`,
      description: `15% off ${team.name} merchandise — race weekend special`,
      discountType: OFFER_DISCOUNT_TYPE.PERCENT,
      discountValue: 15,
      scope: OFFER_SCOPE.TEAM,
      team: team.id,
      minOrderValue: 0,
      maxDiscountAmount: 5000,
      tag: 'race-weekend',
      startsAt: faker.date.recent({ days: 5 }),
      expiresAt: faker.date.soon({ days: 21 }),
    });
  }

  logger.info(`Seeding ${DEMO_ORDER_COUNT} demo orders across varied statuses...`);
  const statusPool: OrderStatus[] = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PAID,
    ORDER_STATUS.PAID,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ];

  for (let i = 0; i < DEMO_ORDER_COUNT; i++) {
    const buyer = faker.helpers.arrayElement(customers);
    const lineCount = faker.number.int({ min: 1, max: 4 });
    const chosenProducts = faker.helpers.arrayElements(allProducts, lineCount);
    const items = chosenProducts.map((product) => {
      const quantity = faker.number.int({ min: 1, max: 3 });
      return {
        product: product._id,
        team: product.team,
        name: product.name,
        image: product.images[0] ?? '',
        unitPrice: product.price,
        quantity,
        subtotal: product.price * quantity,
      };
    });
    const itemsTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const status = faker.helpers.arrayElement(statusPool);
    const paymentStatus = status === ORDER_STATUS.PENDING ? 'unpaid' : status === ORDER_STATUS.CANCELLED ? 'unpaid' : 'paid';
    const shippingFee = itemsTotal >= 10000 ? 0 : 999;

    await Order.create({
      orderNumber: generateOrderNumber(),
      user: buyer.id,
      items,
      shippingAddress: {
        label: 'Home',
        line1: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postalCode: faker.location.zipCode(),
        country: 'United States',
      },
      itemsTotal,
      discountAmount: 0,
      shippingFee,
      totalAmount: itemsTotal + shippingFee,
      paymentStatus,
      status,
      statusHistory: [{ status, changedAt: faker.date.recent({ days: 20 }) }],
    });
  }

  logger.info('Seeding a few product reviews...');
  const reviewedPairs = new Set<string>();
  for (let i = 0; i < 60; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const product = faker.helpers.arrayElement(allProducts);
    const key = `${customer.id}:${product.id}`;
    if (reviewedPairs.has(key)) continue;
    reviewedPairs.add(key);

    await Review.create({
      product: product._id,
      user: customer._id,
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.lorem.sentences(2),
      isVerifiedPurchase: faker.datatype.boolean({ probability: 0.6 }),
    });
  }

  for (const product of allProducts) {
    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = stats[0] ?? {};
    await Product.updateOne(
      { _id: product._id },
      { ratingsAverage: Math.round(avg * 10) / 10, ratingsCount: count },
    );
  }

  logger.info('✅ Seed complete.');
  logger.info('--- Demo credentials ---');
  logger.info(`Admin:      ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
  logger.info(`Race Team:  raceteam+mercedes@shopswift.dev / ${env.SEED_RACETEAM_PASSWORD}`);
  logger.info(`Customer:   customer@shopswift.dev / ${env.SEED_CUSTOMER_PASSWORD}`);
  logger.info(`Pending RT: raceteam+pending@shopswift.dev / ${env.SEED_RACETEAM_PASSWORD} (blocked until approved)`);

  await disconnectDB();
}

main().catch((err) => {
  logger.error('Seed failed', err);
  process.exit(1);
});
