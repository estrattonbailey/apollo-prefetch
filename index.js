import React from 'react'
import { RouterContext } from 'react-router'

/**
 * @param {array} components Component tree for given route
 * @return {array} Array of components that contain a loadProps method
 */
const flattenChildren = components => components.reduce((flattened, next, i) => {
  if (next.WrappedComponent && next.WrappedComponent.loadProps) {
    flattened.push(next.WrappedComponent)
  }
  return flattened
}, [])

/**
 * @param {object} props renderProps react-router and any relevant data
 * @return {promise} Resolves when all queries have been made
 */
export const prefetch = props => {
  return Promise.all(
    flattenChildren(props.components).map((comp, i) => {
      return comp.loadProps(props)
    })
  )
}

export class AsyncProps extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loaded: false,
      location: this.props.location.pathname,
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.location.pathname === this.state.location) {
      return
    }

    if (this.props.onLoad) {
      this.props.onLoad()
    }

    prefetch(newProps).then(res => {
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

  shouldComponentUpdate(newProps, newState) {
    this.setState({
      loaded: false,
    })

    return newState.loaded
  }

  render() {
    return <RouterContext {...this.props}/>
  }
}

export const asyncMiddleware = (options = {}) => props => <AsyncProps {...props} {...options}/>
