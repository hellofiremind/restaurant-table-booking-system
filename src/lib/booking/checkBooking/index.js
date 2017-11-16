import getAllTables from 'lib/table/getAllTables'
import _ from 'lodash'

export default (event, context) =>
  new Promise(async (resolve, reject) => {
    let response
    let statusCode = 200

    let startTime
    let people

    if (event.queryStringParameters) {
      if (event.queryStringParameters.start_time) {
        startTime = event.queryStringParameters.start_time
      } else {
        statusCode = 400
      }
      if (event.queryStringParameters.people) {
        people = event.queryStringParameters.people
      } else {
        statusCode = 400
      }
    } else {
      statusCode = 400
    }

    if (statusCode !== 400) {
      let allTables
      try {
        allTables = JSON.parse((await getAllTables(event, context)).body)
      } catch (error) {
        reject(error)
      }

      let possibleTables = []
      _.map(allTables, (item) => {
        const difference = item.maxOccupancy - people
        if (difference > 0) {
          possibleTables.push(item)
        }
      })

      response = possibleTables
    }

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
