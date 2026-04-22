-- RLS policies for boards
CREATE POLICY "Users can manage own boards" ON boards 
FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for columns (via boards)
CREATE POLICY "Users can manage own columns" ON columns 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = columns.board_id 
    AND boards.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = columns.board_id 
    AND boards.user_id = auth.uid()
  )
);

-- RLS policies for tasks (via columns -> boards)
CREATE POLICY "Users can manage own tasks" ON tasks 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM columns 
    JOIN boards ON boards.id = columns.board_id 
    WHERE columns.id = tasks.column_id 
    AND boards.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM columns 
    JOIN boards ON boards.id = columns.board_id 
    WHERE columns.id = tasks.column_id 
    AND boards.user_id = auth.uid()
  )
);
