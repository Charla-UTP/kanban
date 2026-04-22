import { insforge } from './insforge'

export type Board = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export type Column = {
  id: string
  board_id: string
  name: string
  position: number
  color: string
  created_at: string
}

export type Task = {
  id: string
  column_id: string
  title: string
  description: string | null
  position: number
  time_estimate: string | null
  assignee: string | null
  created_at: string
  updated_at: string
}

export async function getBoards(userId: string): Promise<Board[]> {
  const { data, error } = await insforge.database
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Board[]) || []
}

export async function createBoard(userId: string, name: string, description?: string, color?: string): Promise<Board> {
  const { data, error } = await insforge.database
    .from('boards')
    .insert([{ user_id: userId, name, description: description || null, color: color || '#3b82f6' }])
    .select()
    .single()
  if (error) throw error
  return data as Board
}

export async function updateBoard(id: string, updates: Partial<Board>): Promise<Board> {
  const { data, error } = await insforge.database
    .from('boards')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Board
}

export async function deleteBoard(id: string): Promise<void> {
  const { error } = await insforge.database.from('boards').delete().eq('id', id)
  if (error) throw error
}

export async function getColumns(boardId: string): Promise<Column[]> {
  const { data, error } = await insforge.database
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position')
  if (error) throw error
  return (data as Column[]) || []
}

export async function createColumn(boardId: string, name: string, position?: number): Promise<Column> {
  const { data, error } = await insforge.database
    .from('columns')
    .insert([{ board_id: boardId, name, position: position || 0 }])
    .select()
    .single()
  if (error) throw error
  return data as Column
}

export async function updateColumn(id: string, updates: Partial<Column>): Promise<Column> {
  const { data, error } = await insforge.database
    .from('columns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Column
}

export async function deleteColumn(id: string): Promise<void> {
  const { error } = await insforge.database.from('columns').delete().eq('id', id)
  if (error) throw error
}

export async function getTasks(columnId: string): Promise<Task[]> {
  const { data, error } = await insforge.database
    .from('tasks')
    .select('*')
    .eq('column_id', columnId)
    .order('position')
  if (error) throw error
  return (data as Task[]) || []
}

export async function getAllTasks(boardId: string): Promise<Task[]> {
  const { data, error } = await insforge.database
    .from('tasks')
    .select('*, columns!inner(board_id)')
    .eq('columns.board_id', boardId)
    .order('position')
  if (error) throw error
  return (data as Task[]) || []
}

export type TaskInput = {
  title: string
  description?: string
  time_estimate?: string
  assignee?: string
}

export async function createTask(columnId: string, input: TaskInput): Promise<Task> {
  const { data, error } = await insforge.database
    .from('tasks')
    .insert([{ 
      column_id: columnId, 
      title: input.title, 
      description: input.description || null,
      time_estimate: input.time_estimate || null,
      assignee: input.assignee || null
    }])
    .select()
    .single()
  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await insforge.database
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await insforge.database.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function moveTask(taskId: string, newColumnId: string, newPosition: number): Promise<void> {
  const { error } = await insforge.database
    .from('tasks')
    .update({ column_id: newColumnId, position: newPosition, updated_at: new Date().toISOString() })
    .eq('id', taskId)
  if (error) throw error
}
