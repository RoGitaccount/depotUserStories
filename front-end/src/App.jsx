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

function App() {
  return (
    <Router>
      <div className="App"> <nav> <Link to="/">Promotions</Link> | <Link to="/categories">Catégories</Link> </nav>
        <Routes>
          <Route path="/" element={<Offers />} />
          <Route path="/categories" element={<CategoryList />} />
        </Routes>
      </div>
    </Router>
) }

export default App