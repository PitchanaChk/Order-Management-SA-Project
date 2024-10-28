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

    const handleStatusChange = async (e, paymentId) => {
        const newStatus = e.target.value;
        const purchaseOrderId = payments.find(item => item.paymentId === paymentId).purchaseOrderId;
    
        setStatuses(prevStatuses => ({
            ...prevStatuses,
            [paymentId]: newStatus,
        }));

        try {
            const response = await fetch(`http://localhost/saProject_api/updatePaymentStatus.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    purchaseOrderId: purchaseOrderId,
                    paymentStatus: newStatus, 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }
            console.log('Status updated successfully');
            alert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleToHome = () => {
        navigate('/home');
    };

    const handleToOrder = () => {
        navigate('/order');
    };

    const handleToDelivery = () => {
        navigate('/delivery');
    };

    const handleToPayment = () => {
        navigate('/payment');
    };

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
                <button className="toHome" onClick={handleToHome}>
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
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment.paymentId}>
                                            <td>{payment.paymentId}</td>
                                            <td>{payment.purchaseOrderId}</td>
                                            <td>{statuses[payment.paymentId]}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No payments found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
