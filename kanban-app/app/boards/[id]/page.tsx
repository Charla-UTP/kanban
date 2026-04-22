'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  getBoards,
  updateBoard,
  createColumn,
  updateColumn,
  deleteColumn,
  getColumns,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  Board,
  Column,
  Task,
} from '@/lib/kanban-service'

export default function BoardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const boardId = params.id as string

  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newColumnName, setNewColumnName] = useState('')
  const [addingColumn, setAddingColumn] = useState(false)
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDesc, setEditTaskDesc] = useState('')
  const [editTaskTime, setEditTaskTime] = useState('')
  const [editTaskAssignee, setEditTaskAssignee] = useState('')
  const [editingBoard, setEditingBoard] = useState(false)
  const [editBoardName, setEditBoardName] = useState('')
  const [editingColumn, setEditingColumn] = useState<Column | null>(null)
  const [editColumnName, setEditColumnName] = useState('')

  useEffect(() => {
    if (board) {
      setEditBoardName(board.name)
    }
  }, [board])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user && boardId) {
      loadBoardData()
    }
  }, [user, boardId])

  const loadBoardData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const boards = await getBoards(user.id)
      const found = boards.find((b) => b.id === boardId)
      if (!found) {
        router.push('/boards')
        return
      }
      setBoard(found)
      const cols = await getColumns(boardId)
      setColumns(cols)
      const t = await getAllTasks(boardId)
      setTasks(t)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading board')
    } finally {
      setLoading(false)
    }
  }

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColumnName.trim()) return
    try {
      await createColumn(boardId, newColumnName.trim(), columns.length)
      setNewColumnName('')
      setAddingColumn(false)
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error adding column')
    }
  }

  const handleDeleteColumn = async (id: string) => {
    if (!confirm('¿Eliminar esta columna y todas sus tareas?')) return
    try {
      await deleteColumn(id)
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting column')
    }
  }

  const handleAddTask = async (columnId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      await createTask(columnId, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        time_estimate: newTaskTime.trim() || undefined,
        assignee: newTaskAssignee.trim() || undefined
      })
      setNewTaskTitle('')
      setNewTaskDesc('')
      setNewTaskTime('')
      setNewTaskAssignee('')
      setNewTaskColumn(null)
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error adding task')
    }
  }

  const handleUpdateTask = async (taskId: string) => {
    try {
      await updateTask(taskId, {
        title: editTaskTitle,
        description: editTaskDesc || null,
        time_estimate: editTaskTime || null,
        assignee: editTaskAssignee || null,
      })
      setEditingTask(null)
      setEditTaskTitle('')
      setEditTaskDesc('')
      setEditTaskTime('')
      setEditTaskAssignee('')
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    try {
      await deleteTask(id)
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting task')
    }
  }

  const handleMoveTask = async (taskId: string, toColumnId: string) => {
    try {
      const columnTasks = tasks.filter((t) => t.column_id === toColumnId)
      const newPosition = columnTasks.length
      await moveTask(taskId, toColumnId, newPosition)
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error moving task')
    }
  }

  const handleUpdateBoard = async () => {
    if (!board || !editBoardName.trim()) return
    try {
      await updateBoard(board.id, { name: editBoardName.trim() })
      setEditingBoard(false)
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating board')
    }
  }

  const handleUpdateColumn = async () => {
    if (!editingColumn || !editColumnName.trim()) return
    try {
      await updateColumn(editingColumn.id, { name: editColumnName.trim() })
      setEditingColumn(null)
      setEditColumnName('')
      loadBoardData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating column')
    }
  }

  const getColumnTasks = (columnId: string) => {
    return tasks
      .filter((t) => t.column_id === columnId)
      .sort((a, b) => a.position - b.position)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!user || !board) return null

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/boards"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Mis Tableros
            </a>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: board.color }}
            />
            {editingBoard ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateBoard()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  className="px-2 py-1 text-xl font-semibold border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                  autoFocus
                />
                <button type="submit" className="text-sm text-blue-600 hover:text-blue-700">
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBoard(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ×
                </button>
              </form>
            ) : (
              <h1
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => {
                  setEditingBoard(true)
                  setEditBoardName(board.name)
                }}
                title="Click to edit"
              >
                {board.name}
              </h1>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
        <div className="max-w-full mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 items-start">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-72 bg-zinc-100 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 group">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-medium text-gray-900">{column.name}</h3>
                    <span className="text-xs text-black">
                      ({getColumnTasks(column.id).length})
                    </span>
                    <button
                      onClick={() => {
                        setEditingColumn(column)
                        setEditColumnName(column.name)
                      }}
                      className="text-xs text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Editar
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {getColumnTasks(column.id).map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-md p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setEditingTask(task.id)
                        setEditTaskTitle(task.title)
                        setEditTaskDesc(task.description || '')
                        setEditTaskTime(task.time_estimate || '')
                        setEditTaskAssignee(task.assignee || '')
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-900">{task.title}</span>
                        <div className="flex gap-1">
                          <select
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              if (e.target.value && e.target.value !== column.id) {
                                handleMoveTask(task.id, e.target.value)
                              }
                            }}
                            className="text-xs text-black bg-zinc-100 border-none rounded px-1 py-0.5 cursor-pointer"
                            value={column.id}
                          >
                            <option value={column.id}>Mover</option>
                            {columns
                              .filter((c) => c.id !== column.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  → {c.name}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task.id)
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {(task.description || task.time_estimate || task.assignee) && (
                        <div className="text-xs text-black mt-1 line-clamp-2">
                          {task.description && <p>{task.description}</p>}
                          {task.time_estimate && <p className="text-blue-600">⏱ {task.time_estimate}</p>}
                          {task.assignee && <p className="text-green-600">👤 {task.assignee}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {newTaskColumn === column.id ? (
                  <form
                    onSubmit={(e) => handleAddTask(column.id, e)}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Título"
                      className="w-full px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Descripción"
                      className="w-full px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                    />
                    <input
                      type="text"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      placeholder="Tiempo estimado (ej: 2h)"
                      className="w-full px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                    />
                    <input
                      type="text"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      placeholder="Responsable"
                      className="w-full px-2 py-1 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewTaskColumn(null)
                          setNewTaskTitle('')
                          setNewTaskDesc('')
                          setNewTaskTime('')
                          setNewTaskAssignee('')
                        }}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setNewTaskColumn(column.id)}
                    className="w-full text-left px-2 py-1 text-sm text-black hover:text-black"
                  >
                    + Agregar tarea
                  </button>
                )}
              </div>
            ))}

            {addingColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="flex-shrink-0 w-72 bg-zinc-100 rounded-lg p-3"
              >
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Nombre de columna"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingColumn(false)
                      setNewColumnName('')
                    }}
                    className="py-2 px-4 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAddingColumn(true)}
                className="flex-shrink-0 w-72 py-3 text-center text-black hover:text-black border-2 border-dashed border-zinc-300 rounded-lg"
              >
                + Agregar Columna
              </button>
            )}
          </div>
        </div>
      </main>

      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Editar Tarea</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Descripción
                </label>
                <textarea
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Tiempo estimado
                </label>
                <input
                  type="text"
                  value={editTaskTime}
                  onChange={(e) => setEditTaskTime(e.target.value)}
                  placeholder="ej: 2h"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Responsable
                </label>
                <input
                  type="text"
                  value={editTaskAssignee}
                  onChange={(e) => setEditTaskAssignee(e.target.value)}
                  placeholder="Nombre del responsable"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleUpdateTask(editingTask)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditingTask(null)
                  setEditTaskTitle('')
                  setEditTaskDesc('')
                  setEditTaskTime('')
                  setEditTaskAssignee('')
                }}
                className="flex-1 py-2 px-4 border border-zinc-300 text-black rounded-md hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Editar Columna</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editColumnName}
                  onChange={(e) => setEditColumnName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateColumn}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditingColumn(null)
                  setEditColumnName('')
                }}
                className="flex-1 py-2 px-4 border border-zinc-300 text-black rounded-md hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}