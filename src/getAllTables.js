import getAllTables from 'lib/table/getAllTables'

export const handler = async (event, context, done) => {
  const response = await getAllTables(event, context)
  try {
    done(null, response)
  } catch (error) {
    done(error, error)
  }
}
