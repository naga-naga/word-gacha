import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StoryDisplay } from '../../src/components/StoryDisplay'
import type { Story } from '../../src/types'

describe('StoryDisplay', () => {
  describe('レンダリング', () => {
    it('見出しが表示される', () => {
      render(<StoryDisplay story={null} />)
      expect(screen.getByRole('heading', { name: '生成された文章' })).toBeInTheDocument()
    })
  })

  describe('ストーリーがnullの場合', () => {
    it('初期メッセージが表示される', () => {
      render(<StoryDisplay story={null} />)

      expect(screen.getByText('「ランダム生成」ボタンを押して面白い文章を作ってみましょう！')).toBeInTheDocument()
      expect(screen.getByText('「ランダム生成」ボタンを押して面白い文章を作ってみましょう！')).toHaveClass('empty')
    })
  })

  describe('完全なストーリーの場合', () => {
    it('全要素を含む文章が正しくフォーマットされる', () => {
      const story: Story = {
        when: '昨日の夜',
        where: '公園で',
        who: '太郎が',
        what: 'りんごを',
        how: '食べた',
        result: 'お腹が痛くなった'
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('昨日の夜 公園で 太郎が りんごを 食べた。 そしてお腹が痛くなった。')).toBeInTheDocument()
    })

    it('結果部分に句点がない場合は自動で追加される', () => {
      const story: Story = {
        when: '今朝',
        where: '学校で',
        who: '先生が',
        what: '宿題を',
        how: '忘れた',
        result: '怒られた'
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('今朝 学校で 先生が 宿題を 忘れた。 そして怒られた。')).toBeInTheDocument()
    })

    it('結果部分に既に句点がある場合は重複しない', () => {
      const story: Story = {
        when: '夏休みに',
        where: '海で',
        who: '猫が',
        what: '魚を',
        how: '釣った',
        result: 'みんなが驚いた。'
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('夏休みに 海で 猫が 魚を 釣った。 そしてみんなが驚いた。')).toBeInTheDocument()
    })
  })

  describe('部分的なストーリーの場合', () => {
    it('一部の要素のみでも正しく文章を生成する', () => {
      const story: Story = {
        when: '今朝',
        where: null,
        who: '先生が',
        what: null,
        how: '怒った',
        result: null
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('今朝 先生が 怒った。')).toBeInTheDocument()
    })

    it('結果のみの場合も正しく処理する', () => {
      const story: Story = {
        when: null,
        where: null,
        who: null,
        what: null,
        how: null,
        result: 'お腹が痛くなった'
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('お腹が痛くなった。')).toBeInTheDocument()
    })

    it('基本部分のみで結果がない場合', () => {
      const story: Story = {
        when: '昨日',
        where: '公園で',
        who: '太郎が',
        what: 'ボールを',
        how: '蹴った',
        result: null
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('昨日 公園で 太郎が ボールを 蹴った。')).toBeInTheDocument()
    })
  })

  describe('エッジケース', () => {
    it('全要素がnullまたは空の場合はフォールバックメッセージを表示', () => {
      const story: Story = {
        when: null,
        where: null,
        who: null,
        what: null,
        how: null,
        result: null
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('文章が生成できませんでした。もう少しセンテンスを投稿してみてください。')).toBeInTheDocument()
    })

    it('空文字列の要素は無視される', () => {
      const story: Story = {
        when: '',
        where: '公園で',
        who: '',
        what: 'りんごを',
        how: '食べた',
        result: ''
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('公園で りんごを 食べた。')).toBeInTheDocument()
    })

    it('基本文に句点が既にある場合は重複しない', () => {
      const story: Story = {
        when: '昨日',
        where: '公園で',
        who: '太郎が',
        what: null,
        how: '走った。',
        result: null
      }

      render(<StoryDisplay story={story} />)

      expect(screen.getByText('昨日 公園で 太郎が 走った。')).toBeInTheDocument()
    })

    it('結果のみで基本文がない場合の「そして」処理', () => {
      const story: Story = {
        when: null,
        where: null,
        who: null,
        what: null,
        how: null,
        result: '雨が降った'
      }

      render(<StoryDisplay story={story} />)

      // 基本文がない場合は「そして」を付けない
      expect(screen.getByText('雨が降った。')).toBeInTheDocument()
    })
  })

  describe('CSSクラス', () => {
    it('通常のストーリー表示時は適切なクラスが設定される', () => {
      const story: Story = {
        when: '昨日',
        where: '公園で',
        who: '太郎が',
        what: null,
        how: '走った',
        result: null
      }

      render(<StoryDisplay story={story} />)

      const storyContentDiv = screen.getByText('昨日 公園で 太郎が 走った。').closest('.story-content')
      expect(storyContentDiv).toHaveClass('story-content')
      expect(storyContentDiv).not.toHaveClass('empty')
    })

    it('初期状態では empty クラスが設定される', () => {
      render(<StoryDisplay story={null} />)

      const emptyContentDiv = screen.getByText('「ランダム生成」ボタンを押して面白い文章を作ってみましょう！').closest('.story-content')
      expect(emptyContentDiv).toHaveClass('story-content', 'empty')
    })

    it('メインコンテナに story-display クラスが設定される', () => {
      const story: Story = {
        when: '昨日',
        where: null,
        who: '太郎が',
        what: null,
        how: '走った',
        result: null
      }

      render(<StoryDisplay story={story} />)

      const mainContainer = screen.getByRole('heading', { name: '生成された文章' }).parentElement
      expect(mainContainer).toHaveClass('story-display')
    })
  })
})