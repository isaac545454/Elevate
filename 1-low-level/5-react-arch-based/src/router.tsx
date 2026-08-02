import { Navigate, Route, Routes } from 'react-router-dom'

import { PokemonPage } from './pages/PokemonPage/page'
import { PostsPage } from './pages/PostsPage/page'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/posts" replace />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/pokemon" element={<PokemonPage />} />
    </Routes>
  )
}
