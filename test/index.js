import 'babel-polyfill'
import test from 'ava'
import React from 'react'
import { Router, browserHistory, match, RouterContext } from 'react-router'
import { ApolloProvider } from 'react-apollo'
import client from './client'
import routes from './routes'
import { asyncMiddleware, prefetch, AsyncProps, flattenChildren } from '../'
import jsdom from 'jsdom-global'
import { mount, render } from 'enzyme'

jsdom('<html></html>')

const Root = props => (
  <ApolloProvider client={client}>
    <Router
      history={browserHistory}
      routes={routes}
      render={asyncMiddleware()}
      {...props.renderProps}/>
  </ApolloProvider>
)

const getTree = (loc = '/') => {
  let props

  match({ location: loc, routes }, (error, redirectLocation, renderProps) => {
    if (error) throw new Error(error)
    props = renderProps
  })

  return props
}

test.skip('mounts virtually', t => {
  t.plan(1)

  const app = mount(<Root renderProps={getTree()}/>)

  t.is(typeof app.props().renderProps, 'object')
})

test.skip('flattens top-level graphql-wrapped child components', t => {
  t.plan(2)

  const props = getTree('/about')
  const components = flattenChildren(props.components)

  t.true(Array.isArray(components), 'returns array')
  t.is(components.length, 1)
})

test('watch data', async t => {
  t.plan(1)

  const app = render(<Root renderProps={getTree('/about')}/>)

  console.log(app)

//   const res = await prefetch('/', routes)

//   res.then(res => console.log(res))

  t.true(true)
})
