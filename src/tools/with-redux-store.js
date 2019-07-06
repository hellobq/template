import React, { Component } from 'react'
import store from '../store'

const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore (initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return store
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = store
  }
  return window[__NEXT_REDUX_STORE__]
}

export default App => class AppWithRedux extends Component {
  static async getInitialProps (appContext) {
    // Get or Create the store with `undefined` as initialState
    // This allows you to set a custom default initialState
    const store = getOrCreateStore()

    // Provide the store to getInitialProps of pages
    appContext.ctx.store = store

    let appProps = {}
    if (typeof App.getInitialProps === 'function') {
      appProps = await App.getInitialProps(appContext)
    }

    return {
      ...appProps,
      initialReduxState: store.getState()
    }
  }

  constructor (props) {
    super(props)
    this.store = getOrCreateStore()
  }

  render () {
    return <App {...this.props} store={this.store} />
  }
}
