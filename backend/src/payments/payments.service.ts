import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    }

    async createPaymentIntent(amount: number, currency: string = 'vnd') {
        // MOCK MODE: If key is placeholder or missing, return mock data
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            console.log('Using Mock Payment Mode');
            return {
                clientSecret: 'mock_secret_' + Math.random().toString(36).substring(7),
                isMock: true
            };
        }

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amount, // Amount in smallest currency unit (e.g., dong)
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            isMock: false
        };
    }
}
