import React from 'react'
import ReactDOM from 'react-dom'
import { mounts } from './mounts'

const noop = () => {}

export default function withReactContent(ParentSwal) {
  /* Returns `params` separated into a tuple of `reactParams` (the React params that need to be rendered)
  and`otherParams` (all the other parameters, with any React params replaced with a space ' ') */
  function extractReactParams(params) {
    const reactParams = {}
    const otherParams = {}
    const mountKeys = mounts.map(mount => mount.key)
    Object.entries(params).forEach(([key, value]) => {
      if (mountKeys.includes(key) && React.isValidElement(value)) {
        reactParams[key] = value
        otherParams[key] = ' '
      } else {
        otherParams[key] = value
      }
    })
    return [reactParams, otherParams]
  }
  function render(swal, reactParams) {
    Object.entries(reactParams).forEach(([key, value]) => {
      const mount = mounts.find(mount => mount.key === key)
      const domElement = mount.getter(ParentSwal)
      ReactDOM.render(value, domElement)
      swal.__mountedDomElements.push(domElement)
    })
  }

  function unrender(swal) {
    swal.__mountedDomElements.forEach(domElement => {
      ReactDOM.unmountComponentAtNode(domElement)
    })
    swal.__mountedDomElements = []
  }

  return class extends ParentSwal {
    static argsToParams(args) {
      if (React.isValidElement(args[0]) || React.isValidElement(args[1])) {
        const params = {}
        ;['title', 'html', 'type'].forEach((name, index) => {
          if (args[index] !== undefined) {
            params[name] = args[index]
          }
        })
        return params
      } else {
        return ParentSwal.argsToParams(args)
      }
    }
    _main(params) {
      this.__mountedDomElements = []
      this.__params = Object.assign({}, params)
      const [reactParams, otherParams] = extractReactParams(this.__params)
      const superOnOpen = otherParams.onOpen || noop
      const superOnClose = otherParams.onClose || noop
      return super._main(
        Object.assign({}, otherParams, {
          onOpen: popup => {
            render(this, reactParams)
            superOnOpen(popup)
          },
          onClose: popup => {
            superOnClose(popup)
            unrender(this)
          },
        }),
      )
    }
    update(params) {
      Object.assign(this.__params, params)
      unrender(this)
      const [reactParams, otherParams] = extractReactParams(this.__params)
      super.update(otherParams)
      render(this, reactParams)
    }
  }
}
