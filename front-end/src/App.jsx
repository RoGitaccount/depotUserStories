// import Offers from './components/offer';

// function App() {
//   return (
//     <div className="App">
//       <Offers />
//     </div>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Offers from './components/offer'
import CategoryList from './components/category'
import Register from './components/register'


function App() {
  return (
    <Router>
      <div className="App"> <nav> <Link to="/">Promotions</Link> | <Link to="/categories">Catégories</Link>  | <Link to="/register">Inscription</Link> </nav>
        <Routes>
          <Route path="/" element={<Offers />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
) }

export default App