import React, { Component } from 'react'
import TestUtils from 'react-addons-test-utils'
import jsdom from 'mocha-jsdom'
import sinon from 'sinon'
import { expect } from 'chai'

import throttle from '../src/index'

let clock

before(function () { clock = sinon.useFakeTimers() })
after(function () { clock.restore() })

describe('throttle', function() {
  jsdom()

  const Throttled = throttle(class extends Component {
    render() {
      const { value } = this.props
      return React.createElement('span', null, value)
    }
  }, 10)

  class Wrapper extends Component {
    constructor(props, context) {
      super(props, context)
      this.state = { value: '1' }
    }

    render() {
      const { value } = this.state
      return React.createElement(Throttled, { value })
    }
  }

  function getValue(component) {
    return TestUtils.findRenderedDOMComponentWithTag(component, 'span').innerHTML
  }

  it('should pass props correctly', function() {
    const component = TestUtils.renderIntoDocument(
      React.createElement(Throttled, { value: 'passed' })
    )
    expect(getValue(component)).to.equal('passed')
  })

  it('should throttle props', function() {
    const component = TestUtils.renderIntoDocument(
      React.createElement(Wrapper)
    )
    expect(getValue(component)).to.equal('1')

    component.setState({ value: '2' })
    expect(getValue(component)).to.equal('2')

    component.setState({ value: '3' })
    expect(getValue(component)).to.equal('2')
    clock.tick(9)
    expect(getValue(component)).to.equal('2')
    clock.tick(1)
    expect(getValue(component)).to.equal('3')

    component.setState({ value: '4' })
    expect(getValue(component)).to.equal('3')
    clock.tick(9)
    expect(getValue(component)).to.equal('3')
    clock.tick(1)
    expect(getValue(component)).to.equal('4')

    clock.tick(10)
    component.setState({ value: '5' })
    expect(getValue(component)).to.equal('5')
  })

  it('should use latest props', function() {
    const component = TestUtils.renderIntoDocument(
      React.createElement(Wrapper)
    )
    expect(getValue(component)).to.equal('1')

    component.setState({ value: '2' })
    expect(getValue(component)).to.equal('2')

    component.setState({ value: '3' })
    clock.tick(2)
    expect(getValue(component)).to.equal('2')
    component.setState({ value: '4' })
    clock.tick(2)
    expect(getValue(component)).to.equal('2')
    component.setState({ value: '5' })
    clock.tick(2)
    expect(getValue(component)).to.equal('2')
    component.setState({ value: '6' })
    clock.tick(2)
    expect(getValue(component)).to.equal('2')
    component.setState({ value: '7' })
    clock.tick(2)
    expect(getValue(component)).to.equal('7')
  })
})
