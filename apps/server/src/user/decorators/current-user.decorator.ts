import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../auth/auth.service';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: TokenPayload }>();
    return request.user;
  },
);
