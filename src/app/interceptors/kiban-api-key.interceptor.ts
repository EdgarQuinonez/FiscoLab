import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@environments/environment';

export const kibanApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKey = environment.apiKey;
  const modReq = req.clone({
    headers: req.headers.set('x-api-key', apiKey),
  });
  return next(modReq);
};
