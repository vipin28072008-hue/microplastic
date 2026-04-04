import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar     from './components/Navbar.jsx'
import Home       from './pages/Home.jsx'
import Upload     from './pages/Upload.jsx'
import Processing from './pages/Processing.jsx'
import Result     from './pages/Result.jsx'

export default function App() {
  const [result,  setResult]  = useState(null)
  const [preview, setPreview] = useState(null)

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/upload"     element={<Upload onResult={(d, p) => { setResult(d); setPreview(p) }} />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/result"     element={<Result data={result} originalImage={preview} />} />
      </Routes>
    </>
  )
}
