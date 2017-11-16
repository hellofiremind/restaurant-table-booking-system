const { basename, join } = require('path')
const { DynamoDB } = require('aws-sdk')
const { readFileSync } = require('fs')
const _ = require('lodash')
const async = require('async')
const glob = require('glob')
const yaml = require('node-yaml')

const STAGE = process.env.STAGE

if (!STAGE) {
  throw new Error('$STAGE needs to be defined')
}

let doc

const insert = (files) =>
  files.forEach((file) => {
    const items = JSON.parse(readFileSync(file))
    const tableName = `${STAGE}_${basename(file, '.json')}`

    console.log(`Inserting ${items.length} items into ${tableName}`)

    doc.batchWrite({
      RequestItems: {
        [tableName]: items.map((Item) => ({
          PutRequest: { Item }
        }))
      }
    }, (error, result) => console.log(error, result))
  })

glob(join(process.cwd(), `seed/${STAGE}/db/*.json`), (error, files) => {
  if (error) {
    console.log(error)
  }

  if (process.env.OVERWRITE) {
    yaml.read(join(process.cwd(), './serverless.yml'), (error, serverless) => {
      if (error) {
        return console.log(error)
      }

      const {
        provider: { region },
        resources: { Resources }
      } = serverless

      doc = new DynamoDB.DocumentClient({ region })

      async.series(
        files.map((file) => (done) => {
          const filename = basename(file, '.json')
          const TableName = `${STAGE}_${filename}`
          const AttributesToGet =
            Resources[_.camelCase(filename)].Properties.AttributeDefinitions.map(({ AttributeName }) => AttributeName)

          doc.scan({
            AttributesToGet,
            TableName
          }, (error, response) => {
            if (error) {
              return done(error)
            }

            console.log(response)

            const { Items } = response

            if (Items.length) {
              const deleteRequests = {
                [TableName]: Items.map((Key) => ({
                  DeleteRequest: { Key }
                }))
              }

              console.log(`Deleting ${Items.length} items from ${TableName}`)

              doc.batchWrite({
                RequestItems: deleteRequests
              }, (error, result) => {
                if (error) {
                  return console.log(error)
                }

                console.log(result)
                done(error, result)
              })
            } else {
              done()
            }
          })
        }),
        (error, tables) => {
          if (error) {
            return console.log(error)
          }

          insert(files)
        }
      )
    })
  } else {
    insert(files)
  }
})
