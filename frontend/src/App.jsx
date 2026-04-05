import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Processing from './pages/Processing'
import Result from './pages/Result'

export default function App() {
  const [result, setResult]   = useState(null)
  const [preview, setPreview] = useState(null)

  const handleResult = (data, img) => {
    setResult(data)
    setPreview(img)
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/upload"     element={<Upload onResult={handleResult} />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/result"     element={
          result ? <Result result={result} preview={preview} /> : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
