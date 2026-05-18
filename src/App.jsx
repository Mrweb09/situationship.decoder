import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Decoder from './pages/Decoder.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/decode" element={<Decoder />} />
    </Routes>
  )
}
