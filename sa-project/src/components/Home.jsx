import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css'; 

const Home = () => {
    const [customers, setCustomers] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [profileName, setProfileName] = useState('');
    const navigate = useNavigate(); 
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        customerTaxId: '',
        name: '',
        phone: '',
        email: '',
        address: ''
    });


    useEffect(() => {
        fetchCustomers();
        fetchProfile();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/getTableCustomers.php');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/Employee.php');
            const data = await response.json();
            setProfileName(data.name);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };


    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchId(value);
        setSearchName(value);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.id.includes(searchId) || customer.name.toLowerCase().includes(searchName.toLowerCase())
    );

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

    const handleShowModal = () => {
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCreateCustomer = async () => {
        const { customerTaxId, name, phone, email, address } = newCustomer;
    
        if (!customerTaxId || !name || !phone || !email || !address) {
            alert('Please fill in all fields before submitting');
            return; 
        }
        try {
            const response = await fetch('http://localhost/saProject_api/createCustomer.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCustomer),
            });
    
            if (response.ok) {
                alert('Customer created successfully!');
                fetchCustomers(); 
                setShowModal(false); 
            } else {
                alert('Failed to create customer');
            }
        } catch (error) {
            console.error('Error creating customer:', error);
        }
    };
    
    
    
    

    return (
        <div className="home-container">
            <div className="top-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search customer ID or Name"
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
                <button className="toHome" onClick={handleToHome}>Home</button>
                <button className="toOrder" onClick={handleToOrder}>Order</button>
                <button className="logout-button" onClick={handleLogout}>Log Out</button>
            </div>
            <div className="content">
                <div className="home-page">
                    <label className="labelCustomer">Customers</label>
                    <div className="customers-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id} onClick={() => navigate(`/CustomerDetail/${customer.id}`)} style={{ cursor: 'pointer' }}>
                                            <td>{customer.id}</td>
                                            <td>{customer.name}</td>
                                            <td>{customer.phone}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">No customers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button className="create-button" onClick={handleShowModal}>Create New Customer</button>
                </div>
            </div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2 className='createNewCustomer'>Create New Customer</h2>
                        <form>
                            <input 
                                type="text"
                                name="customerTaxId"
                                placeholder="Customer Tax ID"
                                value={newCustomer.customerTaxId}
                                onChange={handleInputChange}
                                className="newCustomerInput"
                            />
                            <input 
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={newCustomer.name}
                                onChange={handleInputChange}
                                className="newCustomerInput"
                            />
                            <input 
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={newCustomer.phone}
                                onChange={handleInputChange}
                                className="newCustomerInput"
                            />
                            <input 
                                type="text"
                                name="email"
                                placeholder="Email"
                                value={newCustomer.email}
                                onChange={handleInputChange}
                                className="newCustomerInput"
                            />
                            <input 
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={newCustomer.address}
                                onChange={handleInputChange}
                                className="newCustomerInput"
                            />
                            <button type="button" onClick={handleCreateCustomer}>Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
