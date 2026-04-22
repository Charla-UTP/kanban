'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createBoard } from '@/lib/kanban-service'

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6b7280', // gray
]

export default function NewBoardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !user) return

    setLoading(true)
    setError('')

    try {
      const board = await createBoard(user.id, name.trim(), description.trim() || undefined, color)
      router.push(`/boards/${board.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating board')
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-black600">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <a
            href="/boards"
            className="text-sm text-black600 hover:text-black900"
          >
            ← Volver a mis tableros
          </a>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h1 className="text-xl font-semibold text-black900 mb-6">Crear Nuevo Tablero</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black700 mb-1">
                Nombre del tablero
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mi tablero Kanban"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-black700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de tu tablero..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Tablero'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}