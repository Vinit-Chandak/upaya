import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../db/connection';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import type { BookingWithDetails, BookingStatus } from '@upaya/shared';

export const bookingRouter = Router();

const createBookingSchema = z.object({
  pujaCatalogId: z.string().uuid(),
  templeId: z.string().uuid(),
  sankalpName: z.string().min(1).max(255),
  sankalpFatherName: z.string().max(255).default(''),
  sankalpGotra: z.string().max(100).default(''),
  sankalpWish: z.string().max(2000).default(''),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deliveryAddressId: z.string().uuid(),
});

/**
 * POST /api/bookings
 * Create a new puja booking. Requires auth.
 */
bookingRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = createBookingSchema.parse(req.body);

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Verify puja exists
    const puja = await queryOne<{ id: string; price: number; temple_id: string }>(
      `SELECT id, price, temple_id FROM puja_catalog WHERE id = $1 AND status = 'active'`,
      [body.pujaCatalogId],
    );
    if (!puja) {
      throw new AppError(404, 'Puja not found', 'PUJA_NOT_FOUND');
    }

    // Verify temple matches
    if (puja.temple_id !== body.templeId) {
      throw new AppError(400, 'Temple does not match puja', 'TEMPLE_MISMATCH');
    }

    // Verify address belongs to user
    const address = await queryOne<{ id: string }>(
      'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
      [body.deliveryAddressId, user.id],
    );
    if (!address) {
      throw new AppError(404, 'Address not found', 'ADDRESS_NOT_FOUND');
    }

    // Create booking
    const booking = await queryOne<BookingWithDetails>(
      `INSERT INTO bookings (user_id, puja_catalog_id, temple_id, sankalp_name, sankalp_father_name, sankalp_gotra, sankalp_wish, booking_date, status, delivery_address_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'booked', $9)
       RETURNING *`,
      [
        user.id,
        body.pujaCatalogId,
        body.templeId,
        body.sankalpName,
        body.sankalpFatherName,
        body.sankalpGotra,
        body.sankalpWish,
        body.bookingDate,
        body.deliveryAddressId,
      ],
    );

    // Log initial status
    await query(
      `INSERT INTO booking_status_log (booking_id, status, notes) VALUES ($1, 'booked', 'Booking created')`,
      [booking!.id],
    );

    res.status(201).json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});

/**
 * GET /api/bookings
 * List user's bookings. Requires auth.
 */
bookingRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const { status } = req.query;

    let sql = `
      SELECT
        b.*,
        pc.name AS puja_name,
        pc.name_hi AS puja_name_hi,
        pc.price AS puja_price,
        t.name AS temple_name,
        t.name_hi AS temple_name_hi,
        t.city AS temple_city
      FROM bookings b
      JOIN puja_catalog pc ON b.puja_catalog_id = pc.id
      JOIN temples t ON b.temple_id = t.id
      WHERE b.user_id = $1
    `;
    const params: unknown[] = [user.id];

    if (status) {
      sql += ` AND b.status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY b.created_at DESC`;

    const bookings = await query<BookingWithDetails>(sql, params);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings/:id
 * Get a single booking with full details. Requires auth.
 */
bookingRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [req.user!.uid],
    );
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const booking = await queryOne<BookingWithDetails>(
      `SELECT
        b.*,
        pc.name AS puja_name,
        pc.name_hi AS puja_name_hi,
        pc.price AS puja_price,
        t.name AS temple_name,
        t.name_hi AS temple_name_hi,
        t.city AS temple_city
      FROM bookings b
      JOIN puja_catalog pc ON b.puja_catalog_id = pc.id
      JOIN temples t ON b.temple_id = t.id
      WHERE b.id = $1 AND b.user_id = $2`,
      [req.params.id, user.id],
    );

    if (!booking) {
      throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
    }

    // Get status timeline
    const statusLog = await query(
      `SELECT * FROM booking_status_log WHERE booking_id = $1 ORDER BY created_at ASC`,
      [req.params.id],
    );

    // Get video if available
    const video = await queryOne(
      `SELECT * FROM puja_videos WHERE booking_id = $1`,
      [req.params.id],
    );

    // Get certificate if available
    const certificate = await queryOne(
      `SELECT * FROM puja_certificates WHERE booking_id = $1`,
      [req.params.id],
    );

    // Get shipping info if available
    const shipping = await queryOne(
      `SELECT * FROM shipping_orders WHERE booking_id = $1`,
      [req.params.id],
    );

    // Get delivery address
    const address = booking.delivery_address_id
      ? await queryOne('SELECT * FROM addresses WHERE id = $1', [booking.delivery_address_id])
      : null;

    res.json({ booking, statusLog, video, certificate, shipping, address });
  } catch (error) {
    next(error);
  }
});

const updateStatusSchema = z.object({
  status: z.enum([
    'booked',
    'confirmed_by_temple',
    'puja_performed',
    'video_delivered',
    'prasad_shipped',
    'prasad_delivered',
    'protocol_complete',
  ]),
  notes: z.string().optional(),
});

/**
 * PATCH /api/bookings/:id/status
 * Update booking status (for temple admin or internal use). Requires auth.
 */
bookingRouter.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = updateStatusSchema.parse(req.body);

    const booking = await queryOne<{ id: string; status: string }>(
      `SELECT id, status FROM bookings WHERE id = $1`,
      [req.params.id],
    );

    if (!booking) {
      throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
    }

    // Update booking status
    await query(
      `UPDATE bookings SET status = $1 WHERE id = $2`,
      [body.status, req.params.id],
    );

    // Log status change
    await query(
      `INSERT INTO booking_status_log (booking_id, status, notes) VALUES ($1, $2, $3)`,
      [req.params.id, body.status, body.notes || null],
    );

    // If puja_performed, increment temple puja count
    if (body.status === 'puja_performed') {
      const b = await queryOne<{ temple_id: string }>(
        'SELECT temple_id FROM bookings WHERE id = $1',
        [req.params.id],
      );
      if (b) {
        await query(
          'UPDATE temples SET total_pujas_completed = total_pujas_completed + 1 WHERE id = $1',
          [b.temple_id],
        );
      }
    }

    res.json({ success: true, status: body.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, 'Invalid request body', 'VALIDATION_ERROR'));
      return;
    }
    next(error);
  }
});
