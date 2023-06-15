import { useRef, useEffect } from 'react'

import {
  Form,
  Label,
  EmailField,
  PasswordField,
  FieldError,
} from '@redwoodjs/forms'
import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import Button from 'src/components/Button'

const SignupPage = () => {
  const { signUp } = useAuth()
  const saveStripeId = useStripeID()

  // focus on email box on page load
  const usernameRef = useRef()
  useEffect(() => {
    usernameRef.current.focus()
  }, [])

  const onSubmit = async (data) => {
    const response = await signUp({ ...data })

    if (response.message) {
      toast(response.message)
    } else if (response.error) {
      toast.error(response.error)
    } else {
      // user is signed in automatically
      toast.success('Welcome!')

      // get and store stripeID
    }
  }

  return (
    <>
      <MetaTags title="Signup" />

      <main className="rw-main">
        <Toaster toastOptions={{ className: 'rw-toast', duration: 6000 }} />
        <div className="rw-scaffold rw-login-container">
          <div className="rw-segment">
            <header className="rw-segment-header">
              <h2 className="rw-heading rw-heading-secondary">Signup</h2>
            </header>

            <div className="rw-segment-main">
              <div className="rw-form-wrapper">
                <Form onSubmit={onSubmit} className="rw-form-wrapper">
                  <Label
                    name="username"
                    className="rw-label"
                    errorClassName="rw-label rw-label-error"
                  >
                    Email address
                  </Label>
                  <EmailField
                    name="username"
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                    ref={usernameRef}
                    validation={{
                      required: {
                        value: true,
                        message: 'Email address is required',
                      },
                    }}
                  />

                  <FieldError name="username" className="rw-field-error" />

                  <Label
                    name="password"
                    className="rw-label"
                    errorClassName="rw-label rw-label-error"
                  >
                    Password
                  </Label>
                  <PasswordField
                    name="password"
                    className="rw-input"
                    errorClassName="rw-input rw-input-error"
                    autoComplete="current-password"
                    validation={{
                      required: {
                        value: true,
                        message: 'Password is required',
                      },
                    }}
                  />

                  <FieldError name="password" className="rw-field-error" />

                  <Button>Sign Up</Button>
                </Form>
              </div>
            </div>
          </div>
          <div className="rw-login-link">
            <span>Already have an account?</span>{' '}
            <Link to={routes.login()} className="rw-link">
              Log in!
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

const useStripeID = () => {
  const FETCH_AND_STORE_STRIPEID = gql`
    query fetchAndStoreStripeId($id: String!) {
      fetchAndStoreStripeId(id: $id) {
        stripeId
      }
    }
  `
  // Fetch and store Stripe id to db
  const [fetchNStore] = useMutation(
    gql`
      mutation fetchAndStoreStripeId(
        $cart: [ProductInput!]!
        $successUrl: String
        $cancelUrl: String
        $customer: StripeCustomerInput
        $mode: StripeCheckoutModeEnum
      ) {
        checkout(
          cart: $cart
          successUrl: $successUrl
          cancelUrl: $cancelUrl
          customer: $customer
          mode: $mode
        ) {
          id
          url
        }
      }
    `
  )

  return async (id) => {
    const client = useApolloClient()

    // create query
    const result = await client.query({
      query: FETCH_AND_STORE_STRIPEID,
      variables: {
        id: id,
      },
    })

    if (result.error) {
      throw result.error
    }

    return result.data?.retrieveStripeCheckoutSession ?? null
  }
}

export default SignupPage
