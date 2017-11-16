import createCustomer from 'lib/customer/createCustomer'

export const handler = async (event, context, done) => {
  const response = await createCustomer(event, context)
  try {
    done(null, response)
  } catch (error) {
    done(error, error)
  }
}
