class Api::StoriesController < ApplicationController
  before_action :set_story, only: [:show, :destroy]

  def index
    stories = GeneratedStory.order(created_at: :desc)
    render json: { stories: stories.map(&:as_json_with_url) }
  end

  def create
    story = GeneratedStory.new(story_params)

    if story.save
      render json: {
        message: "文章が保存されました",
        story: story.as_json_with_url
      }, status: :created
    else
      render json: { errors: story.errors }, status: :unprocessable_entity
    end
  end

  def show
    render json: { story: @story.as_json_with_url }
  end

  def destroy
    @story.destroy
    render json: { message: "保存した文章が削除されました" }
  end

  private

  def set_story
    @story = GeneratedStory.find_by!(share_token: params[:share_token])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "文章が見つかりません" }, status: :not_found
  end

  def story_params
    params.require(:story).permit(:story_text)
  end
end
