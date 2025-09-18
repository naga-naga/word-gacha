import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// 簡単なテストコンポーネント
function TestComponent() {
  return <div>テスト環境が正常に動作しています</div>
}

describe('テスト環境の確認', () => {
  it('コンポーネントがレンダリングされること', () => {
    render(<TestComponent />)
    expect(screen.getByText('テスト環境が正常に動作しています')).toBeInTheDocument()
  })

  it('基本的なアサーションが動作すること', () => {
    expect(2 + 2).toBe(4)
    expect('hello').toMatch(/lo/)
  })
})