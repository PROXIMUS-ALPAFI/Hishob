/* eslint-disable react/jsx-pascal-case */
import { Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Regesterp from './pages/Regesterp';
import Loginp from './pages/Loginp';



function App() {
  return (
    <>
      <Routes>
        <Route path="/"
          element={
            <Protected_routes>
              <Homepage />
            </Protected_routes>
          }
        />
        <Route path="/register" element={<Regesterp />} />
        <Route path="/login" element={<Loginp />} />
      </Routes>
    </>
  );
}
export function Protected_routes(props) {
  if (localStorage.getItem('user')) {
    return props.children
  }
  else {
    return <Navigate to="/login" />
  }
}
export default App;
