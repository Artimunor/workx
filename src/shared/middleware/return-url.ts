import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '../../modules/auth/service/auth.service';

@Injectable()
export class ReturnUrlMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}
  use(req: Request, res: Response, next: Function) {
    next();
  }
}
