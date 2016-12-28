# apollo-asyncprops
Middleware, HOC, and utilities for prefetching data in React + React-Router + Apollo projects. Inspired by [AsyncProps](https://github.com/ryanflorence/async-props).

### Goals
1. When navigating to a new view, prefetch data for next view, then render view.
2. Prefetch data for a given component tree, returned from react-router.

## Usage
Add `asyncMiddleware` to your router instance:
```javascript
import React from 'react'
import { Router, browserHistory, match, RouterContext } from 'react-router'
import routes from './routes'
import { store, client } from './store'
import { asyncMiddleware } from './AsyncProps'

const Root = props => (
  <ApolloProvider client={client} store={store}>
    <Router
      history={browserHistory}
      routes={routes}
      render={asyncMiddleware({
        onLoad: () => console.log('Loading...'),
        onLoadEnd: () => console.log('Load Complete'),
      })}
      {...props.renderProps}/>
  </ApolloProvider>
)

match({ browserHistory, routes }, (error, redirectLocation, renderProps) => {
  if (error) throw new Error(error)
  render(<Root renderProps={renderProps}/>, document.getElementById('root'))
})
```
Add static `loadProps` method to each of your Apollo wrapped components:
```javascript
import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { client } from '../store'

const PageQuery = gql`
  query getPage($slug: String) {
    page(slug: $slug) {
      title
      content
      featuredImage
    }
  }
`

class Page extends React.Component {
  static loadProps(props) {
    return client.query({
      query: PageQuery,
      variables: {
        slug: props.params.slug,
      },
    })
  }

  render() {
    return this.props.data.loading ? null : (
      {/* markup */}
    )
  }
}

export default graphql(PageQuery, {
  options: props => ({
    variables: {
      slug: props.params.slug,
    },
  }),
})(Page)
```

## Prefetching Route Data Manually
```javascript
import React from 'react'
import { Link } from 'react-router'
import { prefetch } from './AsyncProps'
import routes from 'path/to/routes'

export default props => (
  <header>
    <Link 
      to="/about"
      onMouseOver={e => prefetch('/about', routes, res => console.log('Loaded'))}
      >About Page</Link>
  </header>
)
