import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Muitas requisições. Por favor, aguarde um minuto antes de tentar novamente.' },
  standardHeaders: true,
  legacyHeaders: false,
});
