import checkBooking from 'lib/booking/checkBooking'

export const handler = async (event, context, done) => {
  const response = await checkBooking(event, context)
  try {
    done(null, response)
  } catch (error) {
    done(error, error)
  }
}
