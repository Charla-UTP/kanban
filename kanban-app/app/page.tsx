'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-xl font-semibold text-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Kanban App
          </a>
          {user && (
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
          )}
        </div>
      </header>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            Kanban App
          </h1>
          <p className="max-w-md text-lg leading-8 text-gray-600">
            Aplicación de tableros Kanban para gestionar tus tareas
          </p>
        </div>

        {user ? (
          <div className="flex flex-col gap-4 mt-8">
            <a
              href="/boards"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 text-white px-5 transition-colors hover:bg-blue-700 md:w-[200px]"
            >
              Ver Mis Tableros
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
            <a
              href="/auth/login"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 text-white px-5 transition-colors hover:bg-blue-700 md:w-[158px]"
            >
              Iniciar Sesión
            </a>
            <a
              href="/auth/register"
              className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:bg-black/[.04] md:w-[158px]"
            >
              Regístrate
            </a>
          </div>
        )}
      </main>
    </div>
  )
}