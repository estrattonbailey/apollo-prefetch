import React from 'react'
import { RouterContext, match } from 'react-router'

/**
 * Cache react-router routes config,
 * as well as routes fetched with prefetch()
 * which are stored as strings
 */
const cache = {
  routes: null,
  store: [],
  add(loc) {
    this.store.push(loc)
  },
  exists(loc) {
    return this.store.filter(route => loc === route).length > 0
  }
}

/**
 * @param {array} components Component tree for given route
 * @return {array} Array of components that contain a getInitialProps method
 */
const flattenChildren = components => components.reduce((flattened, next, i) => {
  if (next.WrappedComponent && next.WrappedComponent.getInitialProps) {
    flattened.push(next.WrappedComponent)
  }
  return flattened
}, [])

/**
 * @param {object} props renderProps react-router and any relevant data
 * @return {promise} Resolves when all queries have been made
 */
const load = props => {
  return Promise.all(
    flattenChildren(props.components).map(comp => {
      return comp.getInitialProps(props)
    })
  )
}

/**
 * Fetch data for a given route
 * @param {string|object} location Route to fetch
 * @param {function} cb Async callback, params: error, response
 */
export const prefetch = (options, cb = () => {}) => {
  let { location, routes } = 'object' === typeof options ? options : { location: options }

  if (cache.exists(location)) { 
    return
  } else {
    cache.add(location)
  }

  console.log(routes)

  routes = routes ? routes : cache.routes

  if (!routes) { return console.warn(`No routes were provided to prefetch(${location})`) }

  match({ routes, location }, (error, redirectLocation, renderProps) => {
    if (error) { console.warn(error) }
    return load(renderProps).then(res => cb(null, res)).catch(e => cb(e))
  })
}

/**
 * @param {object} props RenderProps returned from match()
 * @param {object} options passed directly or via asyncMiddleware()
 */
export class AsyncProps extends React.Component {
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

    load(newProps).then(res => {
      this.setState({
        loaded: true,
        location: newProps.location.pathname,
      }, () => {
        if (this.props.onComplete) {
          this.props.onComplete()
        }
      })
    }).catch(err => {
      if (err) { console.warn(err) }
      this.props.router.goBack()
    })
  }

  shouldComponentUpdate (newProps, newState) {
    this.setState({
      loaded: false,
    })

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
  const opts = Object.assign({
    routes: null,
    onLoad: () => {},
    onComplete: () => {},
  }, options)

  cache.routes = opts.routes ? opts.routes : null

  delete opts.routes

  return <AsyncProps {...props} {...opts}/>
}
