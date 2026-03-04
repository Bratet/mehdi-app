import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap((data) => {
          // Audit logging will be implemented with the audit_logs entity
          // For now, just log to console in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[AUDIT] ${method} ${request.url} by ${request.user?.email || 'anonymous'}`);
          }
        }),
      );
    }

    return next.handle();
  }
}
