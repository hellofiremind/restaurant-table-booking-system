import { putCustomer } from 'service/db'
import uuidv4 from 'uuid/v4'

export default (event, context) =>
  new Promise(async (resolve, reject) => {
    let response
    let statusCode = 200
    let customerInfo = {}

    if (event.queryStringParameters && event.queryStringParameters.first_name && event.queryStringParameters.last_name) {
      customerInfo = {
        ...customerInfo,
        customer_id: uuidv4(),
        customer_first_name: event.queryStringParameters.first_name,
        customer_last_name: event.queryStringParameters.last_name
      }

      if (event.queryStringParameters.email) {
        customerInfo = {
          ...customerInfo,
          customer_email: event.queryStringParameters.email
        }
      }

      if (event.queryStringParameters.phone) {
        customerInfo = {
          ...customerInfo,
          customer_phone: event.queryStringParameters.phone
        }
      }

      try {
        putCustomer(customerInfo)
      } catch (error) {
        reject(error)
      }
    } else {
      statusCode = 400
    }

    console.log(event.queryStringParameters)

    response = customerInfo
    try {
      response = {
        statusCode,
        body: JSON.stringify(response)
      }
      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
