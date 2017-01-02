import React from 'react'
import { RouterContext, match } from 'react-router'

/**
 * TODO
 *  - what if component has child component?
 * @param {array} components Component tree for given route
 * @return {array} Array of components that contain a getInitialProps method
 */
export const flattenChildren = components => components.reduce((flattened, next, i) => {
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
 * Util cache to avoid cache hit
 */
let routeCache = []

/**
 * Fetch data for a given route
 * @param {string} location Route to fetch
 * @param {ReactComponent} routes Your react-router tree
 */
export const prefetch = (location, routes) => {
  if (routeCache.filter(route => location === route).length > 0) { return }

  routeCache.push(location)

  match({ routes, location }, (error, redirectLocation, renderProps) => {
    if (error) { console.warn(error) }
    return load(renderProps)
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
        if (this.props.onLoadEnd) {
          this.props.onLoadEnd()
        }
      })
    }).catch(err => {
      if (err) console.warn(err)
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
 * @param {object} options onLoad() and onLoadEnd()
 * @param {object} props RenderProps returned from match()
 */
export const asyncMiddleware = (options = {}) => props => <AsyncProps {...props} {...options}/>
