import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import CustomerDetail from "./components/CustomerDetail";
import ProductDetail from "./components/ProductDetail";
import QuotationDetail from "./components/QuotationDetail";
import Order from "./components/Order";
import OrderDetail from "./components/OrderDetail";
import CreateEmployeeAdmin from "./components/CreateEmployeeAdmin";
import Delivery from "./components/Delivery";
import AllProductDesign from "./components/AllProductDesign";
import OrderDesign from "./components/OrderDesign";
import Payment from "./components/Payment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/customerDetail/:id" element={<CustomerDetail/>} />
        <Route path="/productDetail/:productDetailId" element={<ProductDetail/>} />
        <Route path="/quotation/:quotationId" element={<QuotationDetail/>} />
        <Route path="/order" element={<Order/>} />
        <Route path="/orderDetail/:purchaseOrderId" element={<OrderDetail/>} />
        <Route path="/createEmployee" element={<CreateEmployeeAdmin/>} />
        <Route path="/delivery" element={<Delivery/>} />
        <Route path="/allProductDesign" element={<AllProductDesign/>} />
        <Route path="/ordertDesign" element={<OrderDesign/>} />
        <Route path="/payment" element={<Payment/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
