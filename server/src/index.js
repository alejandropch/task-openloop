require("dotenv").config()
const express = require("express")
const { ApolloServer, gql } = require("apollo-server-express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const xss = require("xss-clean")

const resolvers = require("./graphql/resolvers")
const typeDefs = require("./graphql/schemas")
const connectDB = require("./db")
const app = express()
const PORT = process.env.PORT || 3000
const URI = process.env.MONGO_URI
app.get("/", (req, res) => res.send("hello!"))
app.set("trust proxy", 1)

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
)
app.use(cors())
app.use(helmet())
app.use(xss())

async function start() {
  try {
    await connectDB(URI)
    const server = new ApolloServer({ typeDefs, resolvers })

    await server.start()
    server.applyMiddleware({ app })

    app.listen(PORT, () => console.log("listening on port", PORT))
  } catch (e) {
    console.log(e)
  }
}
start()
