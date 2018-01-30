**Notice:** this library has been used succesfully in production, but it has only been tested with `react-router@3.0.2` and `apollo-client@0.7.3`. It's here for reference, but I won't be putting more work into it and you should probably look elsewhere for solutions.

For a more generic solution that will work with `react-router` v4, try [`react-hydrate`](https://github.com/estrattonbailey/react-hydrate).

# apollo-prefetch
Async middleware and utilities for prefetching data in React + React-Router + Apollo projects. 

Inspired by [AsyncProps](https://github.com/ryanflorence/async-props) and [next.js](https://github.com/zeit/next.js).

### Goals
1. When navigating to a new view, prefetch data for next view, *then* render view.

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

MIT
