import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, optionalAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { Product, ProductWithAI, ProductReview } from '@upaya/shared';

export const storeRouter = Router();

/**
 * GET /api/store
 * List products with optional category filter and search.
 */
storeRouter.get('/', async (req, res, next) => {
  try {
    const { category, search, limit = '20', offset = '0' } = req.query;

    let sql = `SELECT * FROM products WHERE status = 'active'`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR name_hi ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const products = await query<Product>(sql, params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) AS total FROM products WHERE status = 'active'`;
    const countParams: unknown[] = [];
    let countParamIndex = 1;

    if (category) {
      countSql += ` AND category = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (search) {
      countSql += ` AND (name ILIKE $${countParamIndex} OR name_hi ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);

    res.json({
      products,
      total: parseInt(countResult?.total || '0', 10),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/store/recommended
 * AI-personalized product recommendations based on user's diagnosis/kundli.
 */
storeRouter.get('/recommended', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required for recommendations', 'AUTH_REQUIRED');
    }

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Get user's latest diagnosis to find relevant doshas
    const diagnosis = await queryOne<{ id: string; root_dosha: string; free_remedies: string }>(
      `SELECT id, root_dosha, free_remedies FROM diagnoses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [user.id],
    );

    let products: ProductWithAI[];

    if (diagnosis) {
      // Recommend products matching the user's dosha type
      products = await query<ProductWithAI>(
        `SELECT p.*,
          TRUE AS ai_recommended,
          CASE WHEN p.dosha_type = $1 THEN 'Recommended for your ' || p.dosha_type || ' dosha' ELSE NULL END AS ai_reasoning,
          CASE WHEN p.dosha_type = $1 THEN p.dosha_type || ' दोष के लिए अनुशंसित' ELSE NULL END AS ai_reasoning_hi
         FROM products p
         WHERE p.status = 'active'
           AND (p.dosha_type = $1 OR p.dosha_type IS NULL)
         ORDER BY CASE WHEN p.dosha_type = $1 THEN 0 ELSE 1 END, p.rating DESC
         LIMIT 10`,
        [diagnosis.root_dosha],
      );
    } else {
      // No diagnosis — return top-rated products
      products = await query<ProductWithAI>(
        `SELECT p.*,
          FALSE AS ai_recommended,
          NULL AS ai_reasoning,
          NULL AS ai_reasoning_hi
         FROM products p
         WHERE p.status = 'active'
         ORDER BY p.rating DESC, p.review_count DESC
         LIMIT 10`,
        [],
      );
    }

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/store/:id
 * Get product detail.
 */
storeRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await queryOne<Product>(
      `SELECT * FROM products WHERE id = $1 AND status != 'draft'`,
      [req.params.id],
    );

    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
});

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(1).max(2000),
});

/**
 * POST /api/store/:id/reviews
 * Add a review to a product. Requires auth.
 */
storeRouter.post('/:id/reviews', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createReviewSchema.parse(req.body);

    const user = await queryOne<{ id: string; name: string | null }>(
      'SELECT id, name FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Verify product exists
    const product = await queryOne<{ id: string }>(
      `SELECT id FROM products WHERE id = $1 AND status = 'active'`,
      [req.params.id],
    );
    if (!product) throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');

    // Check if user already reviewed this product
    const existing = await queryOne(
      'SELECT id FROM product_reviews WHERE product_id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );
    if (existing) throw new AppError(400, 'You have already reviewed this product', 'ALREADY_REVIEWED');

    // Create review
    const review = await queryOne<ProductReview>(
      `INSERT INTO product_reviews (product_id, user_id, user_name, rating, review_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.id, user.id, user.name, body.rating, body.reviewText],
    );

    // Update product rating and review count
    await query(
      `UPDATE products SET
        review_count = review_count + 1,
        rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM product_reviews WHERE product_id = $1)
       WHERE id = $1`,
      [req.params.id],
    );

    res.status(201).json({ review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/store/:id/reviews
 * List reviews for a product.
 */
storeRouter.get('/:id/reviews', async (req, res, next) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    // Verify product exists
    const product = await queryOne<{ id: string }>(
      'SELECT id FROM products WHERE id = $1',
      [req.params.id],
    );
    if (!product) throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');

    const reviews = await query<ProductReview>(
      `SELECT * FROM product_reviews WHERE product_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.params.id, parseInt(limit as string, 10), parseInt(offset as string, 10)],
    );

    const countResult = await queryOne<{ total: string }>(
      'SELECT COUNT(*) AS total FROM product_reviews WHERE product_id = $1',
      [req.params.id],
    );

    res.json({
      reviews,
      total: parseInt(countResult?.total || '0', 10),
    });
  } catch (error) {
    next(error);
  }
});
