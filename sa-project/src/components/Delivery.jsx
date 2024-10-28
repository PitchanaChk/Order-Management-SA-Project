import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/delivery.css'; 
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';
import deliveryIcon from '../image/delivery.png';
import paymentIcon from '../image/payment.png';

const Delivery = () => {
    const [delivery, setDelivery] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [profileName, setProfileName] = useState('');
    const [statuses, setStatuses] = useState({});  
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchDelivery();
        fetchProfile();
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setProfileName(storedUsername);
        }
    }, []);

    const fetchDelivery = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/getTableDelivery.php');
            const data = await response.json();
            setDelivery(data);
            const initialStatuses = {};
            data.forEach(item => {
                initialStatuses[item.deliveryId] = item.orderStatus; 
            });
            setStatuses(initialStatuses);
        } catch (error) {
            console.error('Error fetching delivery:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const username = localStorage.getItem('username'); 
            const response = await fetch(`http://localhost/saProject_api/getProfileEmployee.php?username=${username}`, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
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

    const filteredDelivery = delivery.filter(delivery =>
        delivery.deliveryId.includes(searchId) || delivery.purchaseOrderId.toLowerCase().includes(searchName.toLowerCase())
    );

    const handleShowPdf = async (deliveryId) => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getDeliveryPdf.php?deliveryId=${deliveryId}`, {
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

    const handleDownloadPdf = async (deliveryId) => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getDeliveryPdf.php?deliveryId=${deliveryId}`, {
                method: 'GET',
            });
    
            if (!response.ok) {
                throw new Error('Error downloading PDF');
            }
    
            const blob = await response.blob(); 
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `delivery_${deliveryId}.pdf`; 
            document.body.appendChild(a);
            a.click();
            a.remove(); 
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handleStatusChange = async (e, deliveryId) => {
        const newStatus = e.target.value;
        const purchaseOrderId = delivery.find(item => item.deliveryId === deliveryId).purchaseOrderId;
    
        setStatuses(prevStatuses => ({
            ...prevStatuses,
            [deliveryId]: newStatus,
        }));
    
        try {
            const response = await fetch(`http://localhost/saProject_api/updateOrderStatus.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    purchaseOrderId: purchaseOrderId,
                    orderStatus: newStatus, 
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
                        placeholder="Search Delivery ID or Purchase Order ID"
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
                <button className="toHome-delivery" onClick={handleToHome}>
                    <img src={homeIcon} className="icon" alt="Home Icon" />
                    Home
                </button>
                <button className="toOrder" onClick={handleToOrder}>
                    <img src={orderIcon} className="icon" alt="Order Icon" />
                    Order
                </button>
                <button className="toDelivery-delivery" onClick={handleToDelivery}>
                    <img src={deliveryIcon} className="icon" alt="Delivery Icon" />
                    Delivery
                </button>
                <button className="toPayment" onClick={handleToPayment}>
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
                    <label className="labelDelivery">Delivery</label>
                    <div className="delivery-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Delivery ID</th>
                                    <th>Purchase ID</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Delivery Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDelivery.length > 0 ? (
                                    filteredDelivery.map((delivery) => (
                                        <tr key={delivery.deliveryId}>
                                            <td>{delivery.deliveryId}</td>
                                            <td>{delivery.purchaseOrderId}</td>
                                            <td>{delivery.deliveryDate}</td>
                                            <td>
                                                <select 
                                                    className="statusDeliveryDropdown" 
                                                    value={statuses[delivery.deliveryId] || ''} 
                                                    onChange={(e) => handleStatusChange(e, delivery.deliveryId)}
                                                >
                                                    <option value="Production Completed">Production Completed</option>
                                                    <option value="In Delivery Process">In Delivery Process</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button className="show-delivery-button" onClick={() => handleShowPdf(delivery.deliveryId)}>
                                                    Show PDF
                                                </button>
                                                <button className="download-delivery-button" onClick={() => handleDownloadPdf(delivery.deliveryId)}>
                                                    Download PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No delivery found</td>
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

export default Delivery;
