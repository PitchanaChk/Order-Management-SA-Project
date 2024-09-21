import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import CustomerDetail from "./components/CustomerDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/customerDetail/:id" element={<CustomerDetail/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
