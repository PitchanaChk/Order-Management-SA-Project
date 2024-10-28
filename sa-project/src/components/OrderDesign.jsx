import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/orderDesign.css'; 
import designIcon from '../image/design.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';

const OrderDesign = () => {
    const [profileName, setProfileName] = useState('');
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statuses, setStatuses] = useState({});
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
            const response = await fetch(`http://localhost/saProject_api/getTablePODesign.php`);
            const data = await response.json();
            setPurchaseOrders(data);
            // Initialize statuses for each order
            const initialStatuses = data.reduce((acc, order) => {
                acc[order.purchaseOrderId] = order.orderStatus;
                return acc;
            }, {});
            setStatuses(initialStatuses);
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

    const handleStatusChange = async (e, purchaseOrderId) => {
        const newStatus = e.target.value;
    
        setStatuses(prevStatuses => ({
            ...prevStatuses,
            [purchaseOrderId]: newStatus,
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

    const handleToDesign = () => navigate('/allProductDesign');
    const handleToOrder = () => navigate('/ordertDesign');
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

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
                <button className="toDesign-d" onClick={handleToDesign}>
                    <img src={designIcon} className="icon" alt="Design Icon" />
                    Design
                </button>
                <button className="toOrder-d" onClick={handleToOrder}>
                    <img src={orderIcon} className="icon" alt="Order Icon" />
                    Order
                </button>
                <button className="toLogOut-design-d" onClick={handleLogout}>
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
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order.purchaseOrderId}>
                                        <td>{order.purchaseOrderId}</td>
                                        <td>{order.quotationId}</td>
                                        <td>
                                            <select 
                                                className="statusDeliveryDropdown" 
                                                value={statuses[order.purchaseOrderId] || ''} 
                                                onChange={(e) => handleStatusChange(e, order.purchaseOrderId)}
                                            >
                                                <option value="Purchase Order Received">Purchase Order Received</option>
                                                <option value="In Production">In Production</option>
                                                <option value="Production Completed">Production Completed</option>
                                                <option value="Edit Product">Edit Product</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No matching orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderDesign;
