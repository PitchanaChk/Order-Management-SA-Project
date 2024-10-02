import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/customerDetail.css';
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';

const CustomerDetail = () => {
    const [profileName, setProfileName] = useState('');
    const [customer, setCustomer] = useState(null);
    const [productDetails, setProductDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newProductDetail, setNewProductDetail] = useState({
        title: '',
        description: ''
    });
    const navigate = useNavigate(); 
    const { id } = useParams(); 

    useEffect(() => {
        fetchProfile();
        fetchCustomerDetail();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/Employee.php');
            const data = await response.json();
            setProfileName(data.name);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchCustomerDetail = async () => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getCustomer.php?id=${id}`);
            const data = await response.json();
            setCustomer(data);
            fetchProductDetails(data.id);
        } catch (error) {
            console.error('Error fetching customer detail:', error);
        }
    };

    const fetchProductDetails = async (customerTaxId) => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getTableProductDetails.php?customerTaxId=${id}`);
            const data = await response.json();
            setProductDetails(data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    const handleToHome = () => {
        navigate('/home');
    };

    const handleToOrder = () => {
        navigate('/order');
    };

    const handleLogout = () => {
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
        setNewProductDetail(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCreateProductDetail = async () => {
        const { title, description } = newProductDetail;
    
        if (!title || !description) {
            alert('Please fill in all fields before submitting');
            return;
        }
    
        try {
            const response = await fetch('http://localhost/saProject_api/createProductDetail.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerTaxId: customer.id,
                    title,
                    description,
                    status: 'Ready to Design',
                    productPhoto: ''  
                }),
            });
    
            if (response.ok) {
                alert('Product detail created successfully!');
                fetchProductDetails(customer.customerTaxId); 
                setShowModal(false);
            } else {
                const errorData = await response.json();
                console.error('Failed to create product detail:', errorData);
                alert(`Failed to create product detail: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error creating product detail:', error);
        }
    };
    
    

    if (customer === null) return <div>No customer found or loading error.</div>;

    return (
        <div className="home-container">
            <div className="top-bar-no-search">
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
                <button className="logout-button" onClick={handleLogout}>
                    <img src={logoutIcon} className="icon" alt="Logout Icon" />
                    Log Out
                </button>
            </div>
            <div className="content-cd">
                <h2 className='customerDetails'>Customer Details</h2>
                <div className='detail'>
                    <div className='c1'>
                        <p className='c1-1'>Company Tax ID : <span>{customer.id}</span></p>
                        <p className='c1-1'>Company Name : <span>{customer.name}</span></p>
                        <p className='c1-2'>Address : <span>{customer.address}</span></p>
                    </div>
                    <div className='c2'>
                        <p>Phone : <span>{customer.phone}</span></p>
                        <p>Email : <span>{customer.email}</span></p>
                    </div>
                </div>
                <h2 className='productDetails'>Product Details</h2>
                <div className='product-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Title</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productDetails.length > 0 ? (
                                productDetails.map(product => (
                                    <tr key={product.productDetailId} onClick={() => navigate(`/ProductDetail/${product.productDetailId}`)} style={{ cursor: 'pointer' }}>
                                        <td>{product.productDetailId}</td>
                                        <td>{product.title}</td>
                                        <td>{product.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No product details found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <button className="create-button" onClick={handleShowModal}>Create New Product Detail</button>
            </div>
            {showModal && (
                <div className="modal-PD">
                    <div className="modal-content-PD">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2 className='createNewProductDetail'>Create New Product Detail</h2>
                        <form>
                            <input 
                                type="text"
                                name="title"
                                placeholder="Title"
                                value={newProductDetail.title}
                                onChange={handleInputChange}
                                className="newProductDetail"
                            />
                            <input 
                                type="text"
                                name="description"
                                placeholder="Description"
                                value={newProductDetail.description}
                                onChange={handleInputChange}
                                className="newProductDetail"
                            />
                            <button type="button" onClick={handleCreateProductDetail}>Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetail;
