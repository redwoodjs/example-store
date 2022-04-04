import { stripe } from 'src/lib/stripe'

/**
 * @param {'payment' | 'subscription'} mode
 * @param {{ id: string, quantity: number }} cart
 */
export const checkout = async ({ mode, cart, customerId }) => {
  // eslint-disable-next-line camelcase
  const line_items = cart.map((product) => ({
    price: product.id,
    quantity: product.quantity,
  }))

  return stripe.checkout.sessions.create({
    success_url: `${
      context.request?.headers?.referer ?? process.env.DOMAIN_URL
    }/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${
      context.request?.headers?.referer ?? process.env.DOMAIN_URL
    }?failure`,
    // eslint-disable-next-line camelcase
    line_items,
    mode,
    payment_method_types: ['card'],
    customer: customerId,
  })
}

export const getSession = ({ id }) => stripe.checkout.sessions.retrieve(id)
