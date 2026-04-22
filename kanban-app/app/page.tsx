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
        <div className="text-zinc-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            Kanban App
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600">
            Aplicación de tableros Kanban para gestionar tus tareas
          </p>
        </div>

        {user ? (
          <div className="flex flex-col gap-4 mt-8">
            <div className="text-zinc-600">
              Bienvenido, <span className="font-medium text-black">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-red-600 text-white px-5 transition-colors hover:bg-red-700 md:w-[200px]"
            >
              Cerrar Sesión
            </button>
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