import * as CONFIG from 'config'
import * as DB from 'constant/db'
import { DynamoDB } from 'aws-sdk'
import _ from 'lodash'
import series from 'async/series'

const {
  custom: {
    dynamodb: {
      start: { port }
    }
  },
  resources: { Resources }
} = require('../../serverless.yml')

const endpoint = process.env.IS_OFFLINE ? `http://localhost:${port}` : undefined
const doc = new DynamoDB.DocumentClient({ ...CONFIG.AWS, endpoint })

const getTableName = (key) =>
  Resources[key].Properties.TableName.replace('${self:provider.stage}', process.env.STAGE) // eslint-disable-line

const dbResponseHandler = (resolve, reject) => (error, data) => {
  if (error) {
    reject(error)
  } else {
    resolve(data)
  }
}

export const dbBatchPut = (table, items) =>
  new Promise((resolve, reject) => {
    const tableName = getTableName(table)
    const chunks =
      _
        .chunk(items, 25)
        .map((chunk, i) => ({
          RequestItems: {
            [tableName]: chunk.map((Item) => ({
              PutRequest: { Item }
            }))
          }
        }))
    series(chunks.map((chunk) => (done) => doc.batchWrite(chunk, done)), (error, responses) => {
      if (error) {
        reject(error)
      } else {
        resolve(responses)
      }
    })
  })

export const dbDelete = (table, Key) =>
  new Promise((resolve, reject) => {
    const TableName = getTableName(table)

    doc.delete({
      Key,
      TableName
    }, dbResponseHandler(resolve, reject))
  })

export const dbGet = (table, Key) =>
  new Promise((resolve, reject) => {
    const TableName = getTableName(table)

    doc.get({
      Key,
      TableName
    }, dbResponseHandler(resolve, reject))
  })

export const dbPut = (table, Item) =>
  new Promise((resolve, reject) => {
    const TableName = getTableName(table)

    doc.put({
      Item,
      TableName
    }, dbResponseHandler(resolve, reject))
  })

export const dbScan = (table, params) =>
  new Promise((resolve, reject) => {
    const TableName = getTableName(table)
    doc.scan({
      ...params,
      TableName
    }, dbResponseHandler(resolve, reject))
  })

export const dbUpdate = (table, Key, ExpressionAttributeNames, ExpressionAttributeValues, UpdateExpression) =>
  new Promise((resolve, reject) => {
    const TableName = getTableName(table)

    doc.update({
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      Key,
      TableName,
      UpdateExpression
    }, dbResponseHandler(resolve, reject))
  })

export const getTables = () =>
  dbScan(DB.TABLE_TABLES, {
    Limit: 2000
  })

export const getPlaceTypes = () =>
  dbGet(DB.TABLE_CONFIG, {
    key: DB.ROW_CONFIG_PLACE_TYPES
  })

export const getWebsites = (Limit, ExclusiveStartKey) =>
  dbScan(DB.TABLE_PLACES, {
    ExclusiveStartKey,
    Limit
  })

export const putCustomer = (customer) => dbPut(DB.TABLE_CUSTOMERS, customer)

export const putBooking = (booking) => dbPut(DB.TABLE_BOOKINGS, booking)
