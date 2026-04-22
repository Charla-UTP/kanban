'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getBoards, updateBoard, deleteBoard, Board } from '@/lib/kanban-service'

export default function BoardsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadBoards()
    }
  }, [user])

  const loadBoards = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await getBoards(user.id)
      setBoards(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading boards')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('¿Eliminar este tablero?')) {
      try {
        await deleteBoard(id)
        loadBoards()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error deleting board')
      }
    }
  }

  const handleEditClick = (board: Board, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingBoard(board)
    setEditName(board.name)
    setEditDescription(board.description || '')
  }

  const handleSaveEdit = async () => {
    if (!editingBoard || !editName.trim()) return
    try {
      await updateBoard(editingBoard.id, { name: editName.trim(), description: editDescription.trim() || null })
      setEditingBoard(null)
      loadBoards()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating board')
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Mis Tableros</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">{user.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-zinc-100 rounded-md transition-colors"
              title="Cerrar Sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <a
            href="/boards/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Nuevo Tablero
          </a>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black mb-4">No tienes tableros todavía</p>
            <a
              href="/boards/new"
              className="text-blue-600 hover:underline"
            >
              Crear tu primer tablero
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => router.push(`/boards/${board.id}`)}
                className="bg-white rounded-lg border border-zinc-200 p-4 cursor-pointer hover:shadow-md transition-shadow group"
              >
                <div
                  className="h-2 w-full rounded-full mb-3"
                  style={{ backgroundColor: board.color }}
                />
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 mb-1">{board.name}</h3>
                  <button
                    onClick={(e) => handleEditClick(board, e)}
                    className="text-xs text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Editar
                  </button>
                </div>
                {board.description && (
                  <p className="text-sm text-black line-clamp-2">{board.description}</p>
                )}
                <button
                  onClick={(e) => handleDelete(board.id, e)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {editingBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Editar Tablero</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Descripción
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditingBoard(null)}
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