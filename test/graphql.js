const server = require('express-graphql')
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema
const casual = require('casual')

const typeDefs = [`
  type Object {
    id: Int
    title: String
  }

  type Query {
    object(name: String): Object
  }

  schema {
    query: Query
  }
`]

const resolvers = {
  Query: {
    object() {
      return {
        id: casual.unix_time,
        title: casual.title,
      }
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

module.exports = server((req, res) => {
  return {
    schema,
    graphiql: true,
  }
})
