import { Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
    </Routes>
  )
}


export default App
