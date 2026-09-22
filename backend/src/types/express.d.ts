// Augments Express's Request type so `req.user` is properly typed
// after JwtAuthGuard runs, instead of being implicitly `any`.
export {};

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      googleId?: string;
      name?: string;
    }
  }
}
