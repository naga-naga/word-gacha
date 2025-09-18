require 'rails_helper'

RSpec.describe Sentence, type: :model do
  describe 'ファクトリー' do
    it '全要素を含む有効なセンテンスを作成できる' do
      sentence = create(:sentence)
      expect(sentence).to be_persisted
      expect(sentence.when_element).to eq('昨日の夜')
      expect(sentence.where_element).to eq('公園で')
      expect(sentence.who_element).to eq('太郎が')
      expect(sentence.what_element).to eq('りんごを')
      expect(sentence.how_element).to eq('食べた')
      expect(sentence.result_element).to eq('お腹が痛くなった')
    end

    it '部分要素のみの有効なセンテンスを作成できる' do
      sentence = create(:sentence, :partial)
      expect(sentence).to be_persisted
      expect(sentence.when_element).to eq('今朝')
      expect(sentence.where_element).to be_nil
      expect(sentence.who_element).to eq('先生が')
      expect(sentence.what_element).to be_nil
      expect(sentence.how_element).to eq('怒った')
      expect(sentence.result_element).to be_nil
    end

    it '空要素のセンテンスを作成できる' do
      sentence = create(:sentence, :empty)
      expect(sentence).to be_persisted
      expect(sentence.when_element).to be_nil
      expect(sentence.where_element).to be_nil
      expect(sentence.who_element).to be_nil
      expect(sentence.what_element).to be_nil
      expect(sentence.how_element).to be_nil
      expect(sentence.result_element).to be_nil
    end
  end

  describe 'データベース属性' do
    let!(:sentence) { create(:sentence) }

    it '必要な属性をすべて持っている' do
      expect(sentence).to respond_to(:when_element)
      expect(sentence).to respond_to(:where_element)
      expect(sentence).to respond_to(:who_element)
      expect(sentence).to respond_to(:what_element)
      expect(sentence).to respond_to(:how_element)
      expect(sentence).to respond_to(:result_element)
      expect(sentence).to respond_to(:created_at)
      expect(sentence).to respond_to(:updated_at)
    end

    it '全テキストフィールドでnil値を許可する' do
      empty_sentence = create(:sentence, :empty)
      empty_sentence.reload
      expect(empty_sentence.when_element).to be_nil
      expect(empty_sentence.where_element).to be_nil
      expect(empty_sentence.who_element).to be_nil
      expect(empty_sentence.what_element).to be_nil
      expect(empty_sentence.how_element).to be_nil
      expect(empty_sentence.result_element).to be_nil
    end

    it 'テキスト値を正しく保存する' do
      sentence.reload
      expect(sentence.when_element).to be_a(String)
      expect(sentence.where_element).to be_a(String)
      expect(sentence.who_element).to be_a(String)
      expect(sentence.what_element).to be_a(String)
      expect(sentence.how_element).to be_a(String)
      expect(sentence.result_element).to be_a(String)
    end
  end

  describe 'クエリメソッド' do
    let!(:various_sentences) { create_list(:sentence, 5, :with_various_data) }
    let!(:partial_sentence) { create(:sentence, :partial) }
    let!(:empty_sentence) { create(:sentence, :empty) }

    it 'null以外の要素でクエリできる' do
      sentences_with_when = Sentence.where.not(when_element: [nil, ""])
      expect(sentences_with_when.count).to be >= 5

      sentences_with_where = Sentence.where.not(where_element: [nil, ""])
      expect(sentences_with_where.count).to be >= 5

      sentences_with_who = Sentence.where.not(who_element: [nil, ""])
      expect(sentences_with_who.count).to be >= 5
    end

    it '空要素を除外できる' do
      non_empty_when = Sentence.where.not(when_element: [nil, ""])
      expect(non_empty_when.count).to eq(6) # 5 + 1 partial

      non_empty_where = Sentence.where.not(where_element: [nil, ""])
      expect(non_empty_where.count).to eq(5) # partial と empty は where_element が nil
    end
  end

  describe '一括データ操作' do
    it '複数のセンテンスを作成できる' do
      expect {
        10.times do |i|
          create(:sentence, when_element: "時刻#{i}", who_element: "人物#{i}")
        end
      }.to change(Sentence, :count).by(10)
    end

    it '複数レコード間でデータの整合性を保持する' do
      sentences = create_list(:sentence, 20, :with_various_data)
      expect(sentences.map(&:when_element).uniq.length).to be >= 4
      expect(sentences.map(&:who_element).uniq.length).to be >= 4
    end
  end
end
