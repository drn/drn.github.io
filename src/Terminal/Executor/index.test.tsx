import { describe, it, expect, vi } from 'vitest'
import Executor from './index'

// eslint-disable-next-line no-control-regex
const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '')

describe('Executor', () => {
  describe('run', () => {
    it('returns success false for unknown commands', () => {
      const executor = new Executor(vi.fn())
      const result = executor.run('bogus')
      expect(result.success).toBe(false)
      expect(result.result).toBe('zsh: command not found: bogus')
    })

    it('run clear returns halt true and calls the clear callback', () => {
      const clearMock = vi.fn()
      const executor = new Executor(clearMock)
      const result = executor.run('clear')
      expect(result.halt).toBe(true)
      expect(result.success).toBe(true)
      expect(clearMock).toHaveBeenCalled()
    })

    it('run whoami returns success true with a defined result', () => {
      const executor = new Executor(vi.fn())
      const result = executor.run('whoami')
      expect(result.success).toBe(true)
      expect(result.result).toBeDefined()
    })

    it('run cat README returns success true', () => {
      const executor = new Executor(vi.fn())
      const result = executor.run('cat README')
      expect(result.success).toBe(true)
    })

    it('returns command not found for empty input', () => {
      const executor = new Executor(vi.fn())
      const result = executor.run('')
      expect(result.success).toBe(false)
      expect(result.result).toBe('zsh: command not found: ')
    })

    it('run cat nope returns the not-found error string', () => {
      const executor = new Executor(vi.fn())
      const result = executor.run('cat nope')
      expect(stripAnsi(result.result ?? '')).toBe(
        'cat: nope: No such file or directory',
      )
    })
  })

  describe('parse', () => {
    it('splits command and arguments', () => {
      const executor = new Executor(vi.fn())
      const parsed = executor.parse('cat README extra')
      expect(parsed.command).toBe('cat')
      expect(parsed.arguments).toEqual(['README', 'extra'])
    })

    it('returns empty command for empty string', () => {
      const executor = new Executor(vi.fn())
      const parsed = executor.parse('')
      expect(parsed.command).toBe('')
    })
  })
})
