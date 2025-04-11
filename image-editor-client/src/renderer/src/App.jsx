import { Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
import Gallery from './pages/Gallery'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  )
}

export default App