class Api::SentencesController < ApplicationController
  def create
    sentence = Sentence.new(sentence_params)

    if sentence.save
      render json: { message: "センテンスが投稿されました", id: sentence.id }, status: :created
    else
      render json: { errors: sentence.errors }, status: :unprocessable_content
    end
  end

  def random
    story_elements = {
      when: random_element(:when_element),
      where: random_element(:where_element),
      who: random_element(:who_element),
      what: random_element(:what_element),
      how: random_element(:how_element),
      result: random_element(:result_element)
    }

    render json: { story: story_elements }
  end

  private

  def sentence_params
    params.require(:sentence).permit(:when_element, :where_element, :who_element,
                                   :what_element, :how_element, :result_element)
  end

  def random_element(column)
    Sentence.where.not(column => [nil, ""]).pluck(column).sample
  end
end
