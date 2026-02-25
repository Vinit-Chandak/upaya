import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { CartItemWithProduct } from '@upaya/shared';

export const cartRouter = Router();

/**
 * GET /api/cart
 * Get the authenticated user's cart with product details.
 */
cartRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const items = await query<CartItemWithProduct>(
      `SELECT
        ci.*,
        p.name AS product_name,
        p.name_hi AS product_name_hi,
        p.images->0 AS product_image,
        p.price AS product_price,
        p.mrp AS product_mrp,
        p.discount_pct AS product_discount_pct,
        p.stock AS product_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [user.id],
    );

    // Calculate cart total
    let totalAmount = 0;
    let totalMrp = 0;
    for (const item of items) {
      totalAmount += item.productPrice * item.quantity;
      totalMrp += item.productMrp * item.quantity;
    }

    res.json({
      items,
      totalAmount,
      totalMrp,
      totalDiscount: totalMrp - totalAmount,
      itemCount: items.length,
    });
  } catch (error) {
    next(error);
  }
});

const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10).default(1),
});

/**
 * POST /api/cart
 * Add a product to cart. Requires auth.
 */
cartRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = addToCartSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Verify product exists and is in stock
    const product = await queryOne<{ id: string; stock: number }>(
      `SELECT id, stock FROM products WHERE id = $1 AND status = 'active'`,
      [body.productId],
    );
    if (!product) throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    if (product.stock < body.quantity) {
      throw new AppError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
    }

    // Check if item already in cart — if so, update quantity
    const existing = await queryOne<{ id: string; quantity: number }>(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [user.id, body.productId],
    );

    let item;
    if (existing) {
      const newQuantity = existing.quantity + body.quantity;
      if (newQuantity > product.stock) {
        throw new AppError(400, 'Insufficient stock for requested quantity', 'INSUFFICIENT_STOCK');
      }
      item = await queryOne(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQuantity, existing.id],
      );
    } else {
      item = await queryOne(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [user.id, body.productId, body.quantity],
      );
    }

    res.status(201).json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

/**
 * PATCH /api/cart/:itemId
 * Update cart item quantity. Requires auth.
 */
cartRouter.patch('/:itemId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = updateCartSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Verify cart item belongs to user
    const cartItem = await queryOne<{ id: string; product_id: string }>(
      'SELECT id, product_id FROM cart_items WHERE id = $1 AND user_id = $2',
      [req.params.itemId, user.id],
    );
    if (!cartItem) throw new AppError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');

    // Check stock
    const product = await queryOne<{ stock: number }>(
      'SELECT stock FROM products WHERE id = $1',
      [cartItem.product_id],
    );
    if (product && body.quantity > product.stock) {
      throw new AppError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
    }

    const updated = await queryOne(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [body.quantity, req.params.itemId],
    );

    res.json({ item: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * DELETE /api/cart/:itemId
 * Remove an item from cart. Requires auth.
 */
cartRouter.delete('/:itemId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const cartItem = await queryOne<{ id: string }>(
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
      [req.params.itemId, user.id],
    );
    if (!cartItem) throw new AppError(404, 'Cart item not found', 'CART_ITEM_NOT_FOUND');

    await query('DELETE FROM cart_items WHERE id = $1', [req.params.itemId]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
