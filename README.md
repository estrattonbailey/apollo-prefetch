# apollo-prefetch
Async middleware and utilities for prefetching data in React + React-Router + Apollo projects. 

Inspired by [AsyncProps](https://github.com/ryanflorence/async-props) and [next.js](https://github.com/zeit/next.js).

### Goals
1. When navigating to a new view, prefetch data for next view, *then* render view.
2. Prefetch data for a given route so Apollo can cache it for faster rendering.

## Install
```bash
npm i apollo-prefetch --save
```

## Usage
Add `asyncMiddleware` to your router instance:
```javascript
import React from 'react'
import { Router, browserHistory, match, RouterContext } from 'react-router'
import routes from './routes'
import { store, client } from './store'
import { asyncMiddleware } from 'apollo-prefetch'

const Root = props => (
  <ApolloProvider client={client} store={store}>
    <Router
      history={browserHistory}
      routes={routes}
      render={asyncMiddleware({
        routes,
        client,
        store,
        onLoad: () => console.log('Loading...'),
        onComplete: () => console.log('Load Complete'),
      })}
      {...props.renderProps}/>
  </ApolloProvider>
)

match({ browserHistory, routes }, (error, redirectLocation, renderProps) => {
  if (error) throw new Error(error)
  render(<Root renderProps={renderProps}/>, document.getElementById('root'))
})
```

## Prefetching Route Data
In addition to the middleware, this library provides an interface to fetch data for a given route ahead of time.
```javascript
import React from 'react'
import { Link } from 'react-router'
import { prefetch } from 'apollo-prefetch'

const callback = (err, res) => {
  if (err) return console.warn(err)
  console.log(res)
}

export default props => (
  <header>
    <Link 
      to="/about"
      onMouseOver={e => prefetch('/about', callback)}>
      About Page</Link>
  </header>
)
```
Apollo-prefetch needs to have react-router route structure accessible, so you should probably supply it as an `asyncMiddleware` option, as shown above. Alternatively, you can pass an object as the first param to `prefetch()`.
```
import routes from 'path/to/routes'

prefetch({
  location: '/about',
  routes,
}, (err, res) => {})
```
