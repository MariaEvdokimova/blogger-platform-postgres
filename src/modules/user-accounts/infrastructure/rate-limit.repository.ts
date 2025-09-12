import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { RateLimit, RateLimitDocument, RateLimitModelType } from "../domain/rate-limit.entity";

@Injectable()
export class RateLimitRepository {

  constructor(@InjectModel(RateLimit.name) private RateLimitModel: RateLimitModelType) {}

  async save( attempt: RateLimitDocument ): Promise<RateLimitDocument> {
    return await attempt.save();
  }
  
  async getAttemptsCountFromDate( ip: string, url: string ): Promise<number> {
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000); // текущая дата минус 10 секунд

    return this.RateLimitModel.countDocuments({ip, url, date: { $gte: tenSecondsAgo } });
  }
}
