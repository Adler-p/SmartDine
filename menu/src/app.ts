import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common'

import { createMenuItemRouter } from './routes/staff/create-new-item'
import { listMenuItemRouter } from './routes/list-one-item'
import { indexMenuRouter } from './routes/index'
import { updateMenuItemRouter } from './routes/staff/update-entire-item'
import { updateMenuItemPriceRouter } from './routes/staff/update-price'
import { markMenuItemOutOfStockRouter } from './routes/staff/mark-out-of-stock'

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
// Staff endpoints
app.use(createMenuItemRouter)
app.use(listMenuItemRouter)
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