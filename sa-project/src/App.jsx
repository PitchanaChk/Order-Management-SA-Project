import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import CustomerDetail from "./components/CustomerDetail";
import ProductDetail from './components/ProductDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/customerDetail/:id" element={<CustomerDetail/>} />
        <Route path="/productDetail/:productDetailId" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
