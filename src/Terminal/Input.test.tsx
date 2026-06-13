// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import Input from './Input'

const renderInput = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  act(() => {
    createRoot(container).render(<Input />)
  })
  const input = container.querySelector('input') as HTMLInputElement
  return { container, input }
}

const press = (
  input: HTMLInputElement,
  key: string,
  init: KeyboardEventInit = {},
) => {
  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
    )
  })
}

describe('Input', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.scrollTo = vi.fn()
  })

  it('runs the typed command on Enter and renders the rows', () => {
    const { container, input } = renderInput()
    input.value = 'bogus'
    press(input, 'Enter')
    expect(container.textContent).toContain('zsh: command not found: bogus')
    expect(container.querySelector('.failure')).not.toBeNull()
    expect(input.value).toBe('')
  })

  it('ignores Enter while an IME composition is in progress', () => {
    const { container, input } = renderInput()
    input.value = 'whoami'
    press(input, 'Enter', { isComposing: true })
    expect(container.textContent).not.toContain('Darren')
    expect(input.value).toBe('whoami')
  })

  it('clears rendered rows when running clear', () => {
    const { container, input } = renderInput()
    input.value = 'bogus'
    press(input, 'Enter')
    expect(container.textContent).toContain('command not found')
    input.value = 'clear'
    press(input, 'Enter')
    expect(container.textContent).not.toContain('command not found')
  })
})
