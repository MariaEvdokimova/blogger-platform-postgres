import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RateLimitRepository } from "../infrastructure/rate-limit.repository";
import { RateLimit, RateLimitModelType } from "../domain/rate-limit.entity";
import { InjectModel } from "@nestjs/mongoose";
import { DomainException } from "../../../core/exceptions/domain-exceptions";
import { DomainExceptionCode } from "../../../core/exceptions/domain-exception-codes";

//!!!!!! не используется, тк поставлена библиотека  - nestjs/throttler
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitRepository: RateLimitRepository,
    @InjectModel(RateLimit.name)
    private readonly rateLimitModel: RateLimitModelType,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || '';
    const url = request.originalUrl;

    const newAttempt = this.rateLimitModel.createInstance({
      ip,
      url,
    });

    await this.rateLimitRepository.save(newAttempt);

    const attempts = await this.rateLimitRepository.getAttemptsCountFromDate(
      ip,
      url,
    );

    if (attempts > 5) {
      throw new DomainException({
        code: DomainExceptionCode.TooManyRequests,
        message: 'TOO MANY REQUESTS',
      });
    }

    return true;
  }
}
