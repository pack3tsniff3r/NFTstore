import './App.css';
import { Route, Routes} from 'react-router-dom'
import NavBar from './components/NavBar'
import { Mint } from './components/pages/Mint'
import { Home } from './components/pages/Home'
function App() {
  return <div classNames="App">
    <NavBar />
      <Routes>
         <Route path="/" element={<Home/>} />
   
         <Route path="/mint" element={<Mint />} />
      </Routes>
  
  </div>;
}

export default App
