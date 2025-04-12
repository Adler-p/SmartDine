import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common'

import { createMenuItemRouter } from './routes/new'
import { showMenuItemRouter } from './routes/show'
import { indexMenuRouter } from './routes/index'
import { updateMenuItemRouter } from './routes/update'
import { updateMenuItemPriceRouter } from './routes/update-price'
import { markMenuItemOutOfStockRouter } from './routes/mark-out-of-stock'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: false
  })
)

// Add currentUser middleware
app.use(currentUser)

// Register routes
app.use(createMenuItemRouter)
app.use(showMenuItemRouter)
app.use(indexMenuRouter)
app.use(updateMenuItemRouter)
app.use(updateMenuItemPriceRouter)
app.use(markMenuItemOutOfStockRouter)

// Handle 404 routes
app.all('*', async (req, res) => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app } 