import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/payment.css'; 
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';
import deliveryIcon from '../image/delivery.png';
import paymentIcon from '../image/payment.png';

const Payment = () => {
    const [payments, setPayments] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [profileName, setProfileName] = useState('');
    const [statuses, setStatuses] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [amount, setAmount] = useState('');
    const [transferImage, setTransferImage] = useState(null);
    const [transferDate, setTransferDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPayments();
        fetchProfile();
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setProfileName(storedUsername);
        }
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/getTablePayment.php');
            const data = await response.json();
            
            setPayments(data);
            const initialStatuses = {};
            data.forEach(item => {
                initialStatuses[item.paymentId] = item.orderStatus; 
            });
            setStatuses(initialStatuses);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };
    
    const fetchProfile = async () => {
        try {
            const username = localStorage.getItem('username'); 
            const response = await fetch(`http://localhost/saProject_api/getProfileEmployee.php?username=${username}`);
            const data = await response.json();
            setProfileName(data[0].result.name); 
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchId(value);
        setSearchName(value);
    };

    const filteredPayments = payments.filter(payment =>
        payment.paymentId.includes(searchId) || payment.purchaseOrderId.toLowerCase().includes(searchName.toLowerCase())
    );

    const handleAddProof = (payment) => {
        setSelectedPayment(payment);
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
        formData.append('paymentId', selectedPayment.paymentId); 
        formData.append('purchaseOrderId', selectedPayment.purchaseOrderId);

        try {
            const response = await fetch('http://localhost/saProject_api/addPaymentProof.php', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to submit proof');
            }
            console.log('Proof submitted successfully');
            alert('Proof submitted successfully!');
            handleCloseModal();
            fetchPayments(); 
        } catch (error) {
            console.error('Error submitting proof:', error);
            alert('Failed to submit proof. Please try again.');
        }
    };

    const handleShowPdf = async (paymentId) => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getReceiptPdf.php?paymentId=${paymentId}`, {
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

    const handleToHome = () => navigate('/home');
    const handleToOrder = () => navigate('/order');
    const handleToDelivery = () => navigate('/delivery');
    const handleToPayment = () => navigate('/payment');
    
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    return (
        <div className="home-container">
            <div className="top-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search Payment ID or Purchase Order ID"
                        value={searchId}
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
            <div className="content">
                <div className="home-page">
                    <label className="labelPayment">Payments</label>
                    <div className="payment-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Purchase ID</th>
                                    <th>Amount Paid</th>
                                    <th>Date/Time</th>
                                    <th>Slip</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment.paymentId}>
                                            <td>{payment.paymentId}</td>
                                            <td>{payment.purchaseOrderId}</td>
                                            <td>{payment.amountPaid ? payment.amountPaid : 'No Proof'}</td>
                                            <td>{payment.paymentDateTime ? payment.paymentDateTime : 'No Proof'}</td>
                                            <td>
                                                {payment.paymentSlip ? (
                                                    <a href={`http://localhost/saProject_api/${payment.paymentSlip}`} target="_blank" rel="noopener noreferrer">
                                                        View Slip
                                                    </a>
                                                ) : (
                                                    'No Slip Available'
                                                )}
                                            </td>
                                            <td className={statuses[payment.paymentId] === 'Pending Payment' ? 'status-pending' : 'status-completed'}>
                                                {statuses[payment.paymentId]}
                                                {statuses[payment.paymentId] === 'Payment Completed' && (
                                                    <button className='show-receipt-button' onClick={() => handleShowPdf(payment.paymentId)}>
                                                        Show Receipt
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <button className='add-proof-button' onClick={() => handleAddProof(payment)}>Add Proof</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">No payments found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
        </div>
    );
};

export default Payment;
