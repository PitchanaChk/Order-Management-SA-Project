import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/payment.css'; 
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';
import deliveryIcon from '../image/delivery.png';
import paymentIcon from '../image/payment.png';

const Payment = () => {
    const [profileName, setProfileName] = useState('');
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [amount, setAmount] = useState('');
    const [transferImage, setTransferImage] = useState(null);
    const [transferDate, setTransferDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchPOPayment();
    }, []);

    const fetchProfile = async () => {
        try {
            const username = localStorage.getItem('username'); 
            const response = await fetch(`http://localhost/backend/getProfileEmployee.php?username=${username}`);
    
            if (!response.ok) throw new Error('Network response was not ok');
    
            const data = await response.json();
            setProfileName(data[0].result.name); 
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchPOPayment = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/backend/getTablePOPayment.php`);
            const data = await response.json();
            setPurchaseOrders(data);
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);  
    };

    const filteredOrders = purchaseOrders.filter(order => 
        order.purchaseOrderId.includes(searchTerm) || 
        order.quotationId.includes(searchTerm)
    );

    const handleAddProof = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setAmount('');
        setTransferImage(null);
        setTransferDate('');
    };

    const handleSubmitProof = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('transferImage', transferImage);
        formData.append('transferDate', transferDate);
        formData.append('purchaseOrderId', selectedOrder.purchaseOrderId);
    
        try {
            const response = await fetch('http://localhost/backend/createPayment.php', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) throw new Error('Failed to submit proof');
    
            alert('Proof submitted successfully!');
            handleCloseModal();
            fetchPOPayment(); 
        } catch (error) {
            console.error('Error submitting proof:', error);
            alert('Failed to submit proof. Please try again.');
        }
    };

    const handleShowProof = async (e) => {
        setSelectedOrder(e);
        try {
            const response = await fetch(`http://localhost/backend/getPaymentDetails.php?purchaseOrderId=${e.purchaseOrderId}`);
            if (!response.ok) throw new Error('Failed to fetch payment details');
            
            const data = await response.json();
            setPaymentDetails(data);
            setShowProofModal(true);
        } catch (error) {
            console.error('Error fetching payment details:', error);
            alert('Failed to fetch payment details. Please try again.');
        }
    };

    const handleCloseProofModal = () => {
        setShowProofModal(false);
        setPaymentDetails(null);
    };

    const handleShowPdf = async (paymentId) => {
        try {
            const response = await fetch(`http://localhost/backend/getReceiptPdf.php?paymentId=${paymentId}`, {
                method: 'GET',
            });
    
            if (!response.ok) {
                throw new Error('Error fetching PDF');
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url); 
        } catch (error) {
            console.error('Error showing PDF:', error);
        }
    };
    

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    const handleToHome = () => navigate('/home');
    const handleToOrder = () => navigate('/order');
    const handleToDelivery = () => navigate('/delivery');
    const handleToPayment = () => navigate('/payment');

    return (
        <div className="home-container">
            <div className="top-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by Order ID or Quotation ID"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <button className="search-button">🔍</button>
                </div>
                <div className="profile-info">
                    <span>{profileName}</span>
                </div>
            </div>
            <div className="sidebar">
                <button className="toHome-p" onClick={handleToHome}>
                    <img src={homeIcon} className="icon" alt="Home Icon" />
                    Home
                </button>
                <button className="toOrder" onClick={handleToOrder}>
                    <img src={orderIcon} className="icon" alt="Order Icon" />
                    Order
                </button>
                <button className="toDelivery" onClick={handleToDelivery}>
                    <img src={deliveryIcon} className="icon" alt="Delivery Icon" />
                    Delivery
                </button>
                <button className="toPayment-p" onClick={handleToPayment}>
                    <img src={paymentIcon} className="icon" alt="Payment Icon" />
                    Payment
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    <img src={logoutIcon} className="icon" alt="Logout Icon" />
                    Log Out
                </button>
            </div>
            <div className="content-pd">
                <h2 className='order-title'>Payments</h2>
                <div className="payment-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Quotation ID</th>
                                <th>PO PDF</th>
                                <th>Status</th>
                                <th>Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order.purchaseOrderId}>
                                        <td>{order.purchaseOrderId}</td>
                                        <td>{order.quotationId}</td>
                                        <td>
                                            {order.purchaseOrderPDF ? (
                                                <a href={`http://localhost/backend/${order.purchaseOrderPDF}`} target="_blank" rel="noopener noreferrer">
                                                    View PO
                                                </a>
                                            ) : (
                                                'No PO Available'
                                            )}
                                        </td>
                                        <td className={order.orderStatus === 'Pending Payment' ? 'status-pending' : order.orderStatus === 'Payment Completed' ? 'status-completed' : ''}>
                                            {order.orderStatus}
                                        </td>
                                        <td>
                                            {order.orderStatus === 'Pending Payment' && (
                                                <button 
                                                    className='add-proof-button' 
                                                    onClick={() => handleAddProof(order)}
                                                    disabled={order.orderStatus === 'Payment Completed'} 
                                                >
                                                    Add Proof
                                                </button>
                                            )}
                                            {order.orderStatus === 'Payment Completed' && (
                                                <button 
                                                    className='show-proof-button' 
                                                    onClick={() => handleShowProof(order)}
                                                >
                                                    Show Proof
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No matching orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content-p">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2 className='addPaymentLabel'>Add Payment Proof</h2>
                        <form onSubmit={handleSubmitProof}>
                            <div>
                                <label className='headLabel'>Amount:</label>
                                <input
                                    className='headInput'
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className='headLabel'>Transfer Image:</label>
                                <input
                                    className='headInput'
                                    type="file"
                                    onChange={(e) => setTransferImage(e.target.files[0])}
                                    accept="image/*"
                                    required
                                />
                            </div>
                            <div>
                                <label className='headLabel'>Transfer Date:</label>
                                <input
                                    className='headInput'
                                    type="datetime-local"
                                    value={transferDate}
                                    onChange={(e) => setTransferDate(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}

            {showProofModal && paymentDetails && (
                <div className="model-payment-detail">
                    <div className="modal-content-payment-detail">
                        <span className="close-payment-detail" onClick={handleCloseProofModal}>&times;</span>
                        <h2 className="proofLabel">Payment Proof Details</h2>
                        <div className="modal-body-payment-detail">
                            <div className="modal-column-left">
                                <div className="modal-item-payment-detail">
                                    <label className="modal-label-payment-detail">Payment ID:</label>
                                    <span className="modal-info-payment-detail">{paymentDetails.paymentId}</span>
                                </div>
                                <div className="modal-item-payment-detail">
                                    <label className="modal-label-payment-detail">Order ID:</label>
                                    <span className="modal-info-payment-detail">{paymentDetails.purchaseOrderId}</span>
                                </div>
                                <div className="modal-item-payment-detail">
                                    <label className="modal-label-payment-detail">Amount Paid:</label>
                                    <span className="modal-info-payment-detail">{paymentDetails.amountPaid}</span>
                                </div>
                            </div>
                            <div className="modal-column-right">
                                <div className="modal-item-payment-detail">
                                    <label className="modal-label-payment-detail">Payment Date & Time:</label>
                                    <span className="modal-info-payment-detail">{paymentDetails.paymentDateTime}</span>
                                </div>
                                <div className="modal-item-payment-detail">
                                    <label className="modal-label-payment-detail">Payment Slip:</label>
                                    <a className="modal-link-payment-detail" href={`http://localhost/backend/${paymentDetails.paymentSlip}`} target="_blank" rel="noopener noreferrer">
                                        View Slip
                                    </a>
                                </div>
                                <div className="modal-item-payment-detail">
                                    <label className="modal-label-payment-detail">Receipt:</label>
                                    <button className="show-receipt" onClick={() => handleShowPdf(paymentDetails.paymentId)}>
                                    Show Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Payment;
