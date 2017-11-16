import { getTables } from 'service/db'
import _ from 'lodash'

export default (event, context) =>
  new Promise(async (resolve, reject) => {
    let response
    let tables = []
    const rawTables = await getTables()

    console.log(rawTables)

    _.map(rawTables.Items, (item) => {
      _.times(item.quantity, (i) => {
        tables.push({
          maxOccupancy: item.occupancy,
          label: `Table ${item.table_numbers[i]}`
        })
      })
    })

    response = tables

    response = {
      statusCode: 200,
      body: JSON.stringify(response)
    }
    resolve(response)
  })
