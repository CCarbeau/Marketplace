import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeAccount = async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: req.body.email,
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.API_URL}/auth/signup`,
      return_url: `${process.env.API_URL}/profile`,
      type: 'account_onboarding',
    });

    res.send({
      accountLink: accountLink.url,
      accountId: account.id,
    });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    res.status(500).send({ error: 'Failed to create Stripe account' });
  }
};
