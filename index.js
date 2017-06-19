import React from 'react'
import { RouterContext, match } from 'react-router'
import { getDataFromTree } from 'react-apollo/lib/index'

/**
 * Cache react-router routes config,
 * as well as routes fetched with prefetch()
 * which are stored as strings
 */
const cache = {
  cached: [],
  add (loc) {
    this.cached.push(loc)
  },
  exists (loc) {
    return this.cached.filter(route => loc === route).length > 0
  },
}

/**
 * Required objects for
 * react-apollo
 */
const context = {
  routes: null,
  client: null,
  store: null,
}

/**
 * @param {object} renderProps renderProps react-router and any relevant data
 * @return {promise} Resolves when all queries have been made
 */
const load = renderProps => {
  return getDataFromTree(<RouterContext {...renderProps}/>, context)
}

/**
 * Fetch data for a given route
 * @param {string|object} location Route to fetch
 * @param {function} cb Async callback, params: error, response
 */
export const prefetch = (options, cb = () => {}) => {
  let { location, routes } = typeof options === 'object' ? options : { location: options }

  if (cache.exists(location)) {
    return
  } else {
    cache.add(location)
  }

  routes = routes || context.routes

  if (!routes) { return console.warn(`No routes were provided to prefetch(${location})`) }

  match({ routes, location }, (err, redirectLocation, renderProps) => {
    if (err) { console.warn(err) }
    return load(renderProps).then(res => cb(null, res)).catch(err => cb(err))
  })
}

/**
 * @param {object} props RenderProps returned from match()
 * @param {object} options passed directly or via asyncMiddleware()
 */
export class AsyncComponent extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loaded: false,
      location: this.props.location.pathname,
    }
  }

  componentWillReceiveProps (newProps) {
    if (newProps.location.pathname === this.state.location) {
      return
    }

    if (this.props.onLoad) {
      this.props.onLoad()
    }

    const complete = () => {
      this.setState({
        loaded: true,
        location: newProps.location.pathname,
      }, () => {
        if (this.props.onComplete) {
          this.props.onComplete()
        }
      })
    }

    if (!context.client) {
      return complete()
    }

    this.setState({
      loaded: false,
    })

    load(newProps).then(complete).catch(err => {
      if (err) { console.warn(err) }
      complete()
    })
  }

  shouldComponentUpdate (newProps, newState) {
    return newState.loaded
  }

  render () {
    return <RouterContext {...this.props}/>
  }
}

/**
 * @param {object} options Config object
 * @param {object} props RenderProps returned from match()
 */
export const asyncMiddleware = options => props => {
  const opts = {}
  opts.onLoad = options.onLoad || null
  opts.onComplete = options.onComplete || null

  context.routes = options.routes || null
  context.client = options.client || null
  context.store = options.store || null

  if (!context.client) {
    console.warn('Apollo client was not passed to apollo-prefetch.')
  }

  return <AsyncComponent {...props} {...opts}/>
}
