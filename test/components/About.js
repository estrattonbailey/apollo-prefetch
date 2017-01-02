import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { client } from '../graphql'

const AboutQuery = gql`
query getObject {
  object {
    id
    title
  }
}
`

class About extends React.Component {
  static getInitialProps(props) {
    return client.query({
      query: AboutQuery
    })
  }

  render() {
    return (
      <h1>About</h1>
    )
  }
}

export default graphql(AboutQuery)(About)
