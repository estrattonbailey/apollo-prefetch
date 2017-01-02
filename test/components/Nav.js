import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { client } from '../graphql'

const NavQuery = gql`
query getObject {
  object {
    id
    title
  }
}
`

class Nav extends React.Component {
  static loadProps(props) {
    return client.query({
      query: NavQuery,
    })
  }

  render() {
    return (
      <header>Nav</header>
    )
  }
}

export default graphql(NavQuery)(Nav)
