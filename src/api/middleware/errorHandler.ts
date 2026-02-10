import type { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Body-parser / raw-body payload too large (e.g. image upload exceeds limit)
const isPayloadTooLarge = (err: unknown): boolean =>
  (err as { type?: string }).type === 'entity.too.large' ||
  (err as { status?: number }).status === 413;

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  if (isPayloadTooLarge(err)) {
    res.status(413).json({
      success: false,
      error: {
        message:
          'Image is too large. Please use an image under 2 MB (e.g. a smaller file or lower resolution).',
        statusCode: 413,
      },
    });
    return;
  }

  // Unexpected errors
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
};
