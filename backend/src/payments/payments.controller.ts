import { Body, Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-intent')
    async createPaymentIntent(@Body() body: { amount: number }) {
        // In a real app, you should validate the amount from the database based on the Order ID
        // sent in the body, rather than trusting the client-side amount.
        // For this MVP, we'll trust the input but it's important to note.
        return this.paymentsService.createPaymentIntent(body.amount);
    }
}
