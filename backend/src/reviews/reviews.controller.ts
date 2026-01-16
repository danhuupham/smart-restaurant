import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    // req.user is populated by JwtAuthGuard -> JwtStrategy
    // Default strategy usually attaches { userId: ... } or full user to req.user
    // In our auth.service.ts, payload is { email, sub: user.id, role }.
    // So req.user.userId (from validate method) or req.user.id depending on Strategy.
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }
}
