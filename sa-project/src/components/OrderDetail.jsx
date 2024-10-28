import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/orderDetail.css'; 
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';
import deliveryIcon from '../image/delivery.png';
import paymentIcon from '../image/payment.png';

const OrderDetail = () => {
    const [profileName, setProfileName] = useState('');
    const { purchaseOrderId } = useParams();
    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchOrderId, setSearchOrderId] = useState('');
    const [searchQuotationId, setSearchQuotationId] = useState('');
    const [statuses, setStatuses] = useState({});   
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchOrderDetail();
    }, [purchaseOrderId]);

    const fetchProfile = async () => {
        try {
            const username = localStorage.getItem('username'); 
            if (!username) {
                console.error('Username not found in localStorage');
                return;
            }

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

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/saProject_api/getOrderDetail.php?purchaseOrderId=${purchaseOrderId}`);
            const data = await response.json();
            setOrderDetail(data);
            setStatuses({ [data.purchaseOrderId]: data.orderStatus }); 
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (e) => {
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

    const filteredOrders = orderDetail 
        ? [orderDetail].filter(order => 
            order.purchaseOrderId.includes(searchOrderId) || 
            order.quotationId.includes(searchQuotationId)
        )
        : [];

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!orderDetail) {
        return <div>No details found for this order.</div>;
    }

    return (
        <div className="home-container">
            <div className="top-bar-no-search">
                <div className="profile-info">
                    <span>{profileName}</span>
                </div>
            </div>
            <div className="sidebar">
                <button className="toHome-od" onClick={handleToHome}>
                    <img src={homeIcon} className="icon" alt="Home Icon" />
                    Home
                </button>
                <button className="toOrder-od" onClick={handleToOrder}>
                    <img src={orderIcon} className="icon" alt="Order Icon" />
                    Order
                </button>
                <button className="toDelivery" onClick={handleToDelivery}>
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
            <div className="content-pd">
                <h2 className='header-order'>Order Details for {purchaseOrderId}</h2>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div key={order.purchaseOrderId}>
                            <div className='order-detail-con'>
                                <div className='order-detail'>
                                    <p><strong>Product Title :</strong> {order.title}</p>
                                    <p><strong>Description :</strong> {order.description}</p>
                                </div>
                            </div>
                            <div className='customer-con'>
                                <div className='customer'>
                                    <p><strong>Customer ID :</strong> {order.customerTaxId}</p>
                                    <p><strong>Customer Name :</strong> {order.name}</p>
                                </div>
                            </div>
                            <div className='orderStatus-con'>
                                <div className='orderStatus'>
                                    <p> <strong>Order Status :</strong> {order.orderStatus}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No matching orders found.</div>
                 )}
            </div>
        </div>
    );
};

export default OrderDetail;
