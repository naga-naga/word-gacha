class CreateSentences < ActiveRecord::Migration[8.0]
  def change
    create_table :sentences do |t|
      t.text :when_element
      t.text :where_element
      t.text :who_element
      t.text :what_element
      t.text :how_element
      t.text :result_element

      t.timestamps
    end
  end
end
