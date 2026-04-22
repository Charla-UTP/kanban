'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getBoards, deleteBoard, Board } from '@/lib/kanban-service'

export default function BoardsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          <h1 className="text-xl font-semibold text-gray-900">Mis Tableros</h1>
          <a
            href="/boards/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Nuevo Tablero
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
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
                className="bg-white rounded-lg border border-zinc-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div
                  className="h-2 w-full rounded-full mb-3"
                  style={{ backgroundColor: board.color }}
                />
                <h3 className="font-medium text-gray-900 mb-1">{board.name}</h3>
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
    </div>
  )
}