import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SentenceForm } from '../../src/components/SentenceForm'
import type { SentenceElements } from '../../src/types'

describe('SentenceForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('レンダリング', () => {
    it('フォームの要素が正しく表示される', () => {
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      expect(screen.getByRole('heading', { name: 'センテンス投稿' })).toBeInTheDocument()
      expect(screen.getByLabelText('いつ:')).toBeInTheDocument()
      expect(screen.getByLabelText('どこで:')).toBeInTheDocument()
      expect(screen.getByLabelText('誰が:')).toBeInTheDocument()
      expect(screen.getByLabelText('何を:')).toBeInTheDocument()
      expect(screen.getByLabelText('どうした:')).toBeInTheDocument()
      expect(screen.getByLabelText('そしてどうなった:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '投稿する' })).toBeInTheDocument()
    })

    it('プレースホルダーが正しく設定されている', () => {
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      expect(screen.getByPlaceholderText('昨日の夜、今朝、夏休みに...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('公園で、学校で、家で...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('太郎が、先生が、猫が...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('りんごを、宿題を、ボールを...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('食べた、忘れた、投げた...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('お腹が痛くなった、怒られた、窓が割れた...')).toBeInTheDocument()
    })
  })

  describe('入力操作', () => {
    it('各フィールドに入力できる', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      const whenInput = screen.getByLabelText('いつ:')
      const whereInput = screen.getByLabelText('どこで:')
      const whoInput = screen.getByLabelText('誰が:')

      await user.type(whenInput, '昨日の夜')
      await user.type(whereInput, '公園で')
      await user.type(whoInput, '太郎が')

      expect(whenInput).toHaveValue('昨日の夜')
      expect(whereInput).toHaveValue('公園で')
      expect(whoInput).toHaveValue('太郎が')
    })

    it('全てのフィールドに入力できる', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      const testData = {
        when: '昨日の夜',
        where: '公園で',
        who: '太郎が',
        what: 'りんごを',
        how: '食べた',
        result: 'お腹が痛くなった'
      }

      await user.type(screen.getByLabelText('いつ:'), testData.when)
      await user.type(screen.getByLabelText('どこで:'), testData.where)
      await user.type(screen.getByLabelText('誰が:'), testData.who)
      await user.type(screen.getByLabelText('何を:'), testData.what)
      await user.type(screen.getByLabelText('どうした:'), testData.how)
      await user.type(screen.getByLabelText('そしてどうなった:'), testData.result)

      expect(screen.getByLabelText('いつ:')).toHaveValue(testData.when)
      expect(screen.getByLabelText('どこで:')).toHaveValue(testData.where)
      expect(screen.getByLabelText('誰が:')).toHaveValue(testData.who)
      expect(screen.getByLabelText('何を:')).toHaveValue(testData.what)
      expect(screen.getByLabelText('どうした:')).toHaveValue(testData.how)
      expect(screen.getByLabelText('そしてどうなった:')).toHaveValue(testData.result)
    })
  })

  describe('フォーム送信', () => {
    it('完全なデータでフォーム送信される', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      const expectedData: Required<SentenceElements> = {
        when_element: '昨日の夜',
        where_element: '公園で',
        who_element: '太郎が',
        what_element: 'りんごを',
        how_element: '食べた',
        result_element: 'お腹が痛くなった'
      }

      await user.type(screen.getByLabelText('いつ:'), expectedData.when_element)
      await user.type(screen.getByLabelText('どこで:'), expectedData.where_element)
      await user.type(screen.getByLabelText('誰が:'), expectedData.who_element)
      await user.type(screen.getByLabelText('何を:'), expectedData.what_element)
      await user.type(screen.getByLabelText('どうした:'), expectedData.how_element)
      await user.type(screen.getByLabelText('そしてどうなった:'), expectedData.result_element)

      await user.click(screen.getByRole('button', { name: '投稿する' }))

      expect(mockOnSubmit).toHaveBeenCalledWith(expectedData)
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it('部分的なデータでフォーム送信される', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      await user.type(screen.getByLabelText('いつ:'), '今朝')
      await user.type(screen.getByLabelText('誰が:'), '先生が')
      await user.type(screen.getByLabelText('どうした:'), '怒った')

      await user.click(screen.getByRole('button', { name: '投稿する' }))

      expect(mockOnSubmit).toHaveBeenCalledWith({
        when_element: '今朝',
        who_element: '先生が',
        how_element: '怒った'
      })
    })

    it('空白のみのフィールドは送信データから除外される', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      await user.type(screen.getByLabelText('いつ:'), '  ') // 空白のみ
      await user.type(screen.getByLabelText('誰が:'), '太郎が')
      await user.type(screen.getByLabelText('どうした:'), '走った')

      await user.click(screen.getByRole('button', { name: '投稿する' }))

      expect(mockOnSubmit).toHaveBeenCalledWith({
        who_element: '太郎が',
        how_element: '走った'
      })
    })

    it('送信後にフォームがリセットされる', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      await user.type(screen.getByLabelText('いつ:'), '昨日')
      await user.type(screen.getByLabelText('誰が:'), '太郎が')

      await user.click(screen.getByRole('button', { name: '投稿する' }))

      await waitFor(() => {
        expect(screen.getByLabelText('いつ:')).toHaveValue('')
        expect(screen.getByLabelText('誰が:')).toHaveValue('')
      })
    })
  })

  describe('ローディング状態', () => {
    it('ローディング中はボタンが無効化される', () => {
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={true} />)

      const submitButton = screen.getByRole('button')
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('投稿中...')
    })

    it('ローディングしていない時はボタンが有効', () => {
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      const submitButton = screen.getByRole('button')
      expect(submitButton).not.toBeDisabled()
      expect(submitButton).toHaveTextContent('投稿する')
    })
  })

  describe('フォームバリデーション', () => {
    it('Enter キーでフォーム送信される', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      await user.type(screen.getByLabelText('誰が:'), '太郎が')
      await user.keyboard('{Enter}')

      expect(mockOnSubmit).toHaveBeenCalledWith({
        who_element: '太郎が'
      })
    })

    it('空のフォームでも送信できる', async () => {
      const user = userEvent.setup()
      render(<SentenceForm onSubmit={mockOnSubmit} isLoading={false} />)

      await user.click(screen.getByRole('button', { name: '投稿する' }))

      expect(mockOnSubmit).toHaveBeenCalledWith({})
    })
  })
})