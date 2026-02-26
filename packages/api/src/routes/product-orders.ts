import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { ProductOrder } from '@upaya/shared';

export const productOrderRouter = Router();

const createOrderSchema = z.object({
  shippingAddressId: z.string().uuid(),
});

/**
 * POST /api/product-orders
 * Create an order from the user's cart items. Requires auth.
 */
productOrderRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createOrderSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    // Verify address belongs to user
    const address = await queryOne<{ id: string }>(
      'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
      [body.shippingAddressId, user.id],
    );
    if (!address) throw new AppError(404, 'Address not found', 'ADDRESS_NOT_FOUND');

    // Get cart items with product details
    const cartItems = await query<{
      id: string;
      product_id: string;
      quantity: number;
      price: number;
      stock: number;
    }>(
      `SELECT ci.id, ci.product_id, ci.quantity, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [user.id],
    );

    if (cartItems.length === 0) {
      throw new AppError(400, 'Cart is empty', 'CART_EMPTY');
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        throw new AppError(400, `Insufficient stock for product ${item.product_id}`, 'INSUFFICIENT_STOCK');
      }
    }

    // Calculate total
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += item.price * item.quantity;
    }

    // Create order
    const order = await queryOne<ProductOrder>(
      `INSERT INTO product_orders (user_id, total_amount, shipping_address_id, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [user.id, totalAmount, body.shippingAddressId],
    );

    // Create order items and decrement stock
    for (const item of cartItems) {
      await query(
        `INSERT INTO product_order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order!.id, item.product_id, item.quantity, item.price],
      );

      // Decrement stock
      await query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id],
      );
    }

    // Clear the cart
    await query('DELETE FROM cart_items WHERE user_id = $1', [user.id]);

    res.status(201).json({ order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/product-orders
 * List the authenticated user's orders. Requires auth.
 */
productOrderRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const { status } = req.query;

    let sql = 'SELECT * FROM product_orders WHERE user_id = $1';
    const params: unknown[] = [user.id];

    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const orders = await query<ProductOrder>(sql, params);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/product-orders/:id
 * Get order detail with items. Requires auth.
 */
productOrderRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const order = await queryOne<ProductOrder>(
      'SELECT * FROM product_orders WHERE id = $1 AND user_id = $2',
      [req.params.id, user.id],
    );
    if (!order) throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND');

    // Get order items with product details
    const items = await query(
      `SELECT
        poi.*,
        p.name AS product_name,
        p.name_hi AS product_name_hi,
        p.images->0 AS product_image
       FROM product_order_items poi
       JOIN products p ON poi.product_id = p.id
       WHERE poi.order_id = $1
       ORDER BY poi.created_at ASC`,
      [req.params.id],
    );

    // Get shipping address
    const shippingAddress = order.shippingAddressId
      ? await queryOne(
          'SELECT name, line1, city, state, pincode FROM addresses WHERE id = $1',
          [order.shippingAddressId],
        )
      : null;

    res.json({ order, items, shippingAddress });
  } catch (error) {
    next(error);
  }
});
