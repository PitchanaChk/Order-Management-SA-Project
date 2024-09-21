import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/customerDetail.css';

const CustomerDetail = () => {
    const [profileName, setProfileName] = useState('');
    const navigate = useNavigate(); 
    const { id } = useParams(); 
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/Employee.php');
            const data = await response.json();
            setProfileName(data.name);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        const fetchCustomerDetail = async () => {
            try {
                const response = await fetch(`http://localhost/saProject_api/getCustomer.php?id=${id}`);
                const data = await response.json();
                console.log('Fetched customer data:', data);
                setCustomer(data);
            } catch (error) {
                console.error('Error fetching customer detail:', error);
            }
        };

        fetchCustomerDetail();
    }, [id]);

    if (customer === null) return <div>No customer found or loading error.</div>;

    const handleToHome = async () => {
        navigate('/home');
    };

    const handleToOrder = async () => {
        navigate('/order');
    };

    const handleLogout = async () => {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        navigate('/', { replace: true });
    };

    return (
        <div className="home-container">
            <div className="top-bar-no-search"></div>
            <div className="sidebar">
                <button className="toHome" onClick={handleToHome}>Home</button>
                <button className="toOrder" onClick={handleToOrder}>Order</button>
                <button className="logout-button" onClick={handleLogout}>Log Out</button>
            </div>
            <div className="content-cd">
                <h2 className='customerDetails'>Customer Details</h2>
                <div className='detail'>
                    <div className='c1'>
                        <p>Company Tax ID : <span>{customer.id}</span></p>
                        <p>Company Name : <span>{customer.name}</span></p>
                        <p>Address : <span>{customer.address}</span></p>
                    </div>
                    <div className='c2'>
                        <p>Phone : <span>{customer.phone}</span></p>
                        <p>Email : <span>{customer.email}</span></p>
                    </div>
                </div>
                <h2 className='productDetails'>Product Details</h2>
            </div>
        </div>
    );
};

export default CustomerDetail;
