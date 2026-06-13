// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import Row from './Row'

// proves react-anime (peer-pinned to React 17) renders under React 18
const render = (content: any) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    createRoot(container).render(<Row content={content} />)
  })
  return container
}

describe('Row', () => {
  it('renders command rows with the typed input and indicator', () => {
    const container = render({
      type: 'command',
      body: 'whoami',
      success: true,
    })
    expect(container.textContent).toContain('❯')
    expect(container.textContent).toContain('whoami')
    expect(container.querySelector('.success')).not.toBeNull()
  })

  it('renders failed command rows with the failure class', () => {
    const container = render({ type: 'command', body: 'bogus', success: false })
    expect(container.querySelector('.failure')).not.toBeNull()
  })

  it('renders result rows through the react-anime wrapper', () => {
    const container = render({ type: 'result', body: 'result body' })
    expect(container.textContent).toContain('result body')
  })
})
