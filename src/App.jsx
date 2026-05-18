import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Decoder from './pages/Decoder.jsx'
import Breadcrumbing from './pages/blog/Breadcrumbing.jsx'
import Ghosting from './pages/blog/Ghosting.jsx'
import WhatIsASituationship from './pages/blog/WhatIsASituationship.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/decode" element={<Decoder />} />
      <Route path="/blog/what-is-breadcrumbing" element={<Breadcrumbing />} />
      <Route path="/blog/signs-of-ghosting" element={<Ghosting />} />
      <Route path="/blog/what-is-a-situationship" element={<WhatIsASituationship />} />
    </Routes>
  )
}
