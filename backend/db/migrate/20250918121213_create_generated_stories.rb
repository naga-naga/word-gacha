class CreateGeneratedStories < ActiveRecord::Migration[8.0]
  def change
    create_table :generated_stories do |t|
      t.text :story_text, null: false
      t.string :share_token, null: false

      t.timestamps
    end

    add_index :generated_stories, :share_token, unique: true
  end
end
