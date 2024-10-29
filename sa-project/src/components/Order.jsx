import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/order.css'; 
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';
import deliveryIcon from '../image/delivery.png';
import paymentIcon from '../image/payment.png';

const Order = () => {
    const [profileName, setProfileName] = useState('');
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [newStatus, setNewStatus] = useState({}); // Change to object for individual order statuses
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchPurchaseOrders();
    }, []);

    const fetchProfile = async () => {
        try {
            const username = localStorage.getItem('username'); 
            const response = await fetch(`http://localhost/saProject_api/getProfileEmployee.php?username=${username}`);
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            setProfileName(data[0].result.name); 
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchPurchaseOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/saProject_api/getTablePurchaseOrders.php`);
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

    const handleRowClick = (purchaseOrderId) => {
        navigate(`/orderDetail/${purchaseOrderId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    const handleUpdateStatus = async (purchaseOrderId) => {
        const statusToUpdate = newStatus[purchaseOrderId];

        if (!statusToUpdate) {
            alert('Please select a status to update.');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost/saProject_api/updateOrderStatus.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    purchaseOrderId: purchaseOrderId,
                    orderStatus: statusToUpdate,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            alert('Status updated successfully!');
            fetchPurchaseOrders(); // Refresh the purchase orders
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleStatusChange = (purchaseOrderId, status) => {
        setNewStatus((prevStatus) => ({
            ...prevStatus,
            [purchaseOrderId]: status,
        }));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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
                <button className="toHome-od" onClick={() => navigate('/home')}>
                    <img src={homeIcon} className="icon" alt="Home Icon" />
                    Home
                </button>
                <button className="toOrder-od" onClick={() => navigate('/order')}>
                    <img src={orderIcon} className="icon" alt="Order Icon" />
                    Order
                </button>
                <button className="toDelivery" onClick={() => navigate('/delivery')}>
                    <img src={deliveryIcon} className="icon" alt="Delivery Icon" />
                    Delivery
                </button>
                <button className="toPayment" onClick={() => navigate('/payment')}>
                    <img src={paymentIcon} className="icon" alt="Payment Icon" />
                    Payment
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    <img src={logoutIcon} className="icon" alt="Logout Icon" />
                    Log Out
                </button>
            </div>
            <div className="content-pd">
                <h2 className='order-title'>Orders</h2>
                <div className="order-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Quotation ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order.purchaseOrderId}>
                                        <td>{order.purchaseOrderId}</td>
                                        <td>{order.quotationId}</td>
                                        <td>{order.orderStatus}</td>
                                        <td>
                                            <select 
                                                className='statusOrderDropdown'
                                                value={newStatus[order.purchaseOrderId] || ''} 
                                                onChange={(e) => handleStatusChange(order.purchaseOrderId, e.target.value)}
                                            >
                                                <option value="" disabled>Select Status</option>
                                                <option value="Edit Product">Edit Product</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                            <button className = 'update-order-button' onClick={() => handleUpdateStatus(order.purchaseOrderId)}>Update</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No matching orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Order;
