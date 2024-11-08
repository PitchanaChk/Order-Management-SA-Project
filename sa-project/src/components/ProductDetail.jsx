import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/productDetail.css';
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';
import deliveryIcon from '../image/delivery.png';
import paymentIcon from '../image/payment.png';

const ProductDetail = () => {
    const { productDetailId } = useParams(); 
    const [product, setProduct] = useState(null);
    const [profileName, setProfileName] = useState('');
    const [status, setStatus] = useState('');
    const [imageLink, setImageLink] = useState('');
    const [quotations, setQuotations] = useState([]);  
    const [showModal, setShowModal] = useState(false);
    const [quotationItems, setQuotationItems] = useState([{ orderItemId: '', quotationId:'' ,itemName: '', price: '', quantity: '' }]); 
    const [newQuotation, setNewQuotation] = useState({
        itemName: '',
        price: '',
        quantity: ''
    });
    const [nextItemId, setNextItemId] = useState(2); 
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchProfile();
        fetchProductDetail();
        fetchQuotations();  
    }, [productDetailId]);

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

    const fetchProductDetail = async () => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getProductDetail.php?id=${productDetailId}`);
            const data = await response.json();
            setProduct(data);
            setStatus(data.status); 
            setImageLink(data.productPhoto);
        } catch (error) {
            console.error('Error fetching product detail:', error);
        }
    };

    const fetchQuotations = async () => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getTableQuotations.php?productDetailId=${productDetailId}`);
            const data = await response.json();
            setQuotations(data);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        }
    };

    /*const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        try {
            const response = await fetch('http://localhost/saProject_api/updateProductStatus.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productDetailId: productDetailId,
                    status: newStatus,
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
    };*/

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

    const handleToDelivery = () => {
        navigate('/delivery');
    };

    const handleToPayment = () => {
        navigate('/payment');
    };

    const handleShowModal = () => {
        if (status === 'Confirm Design') {
            setShowModal(true);
        } else {
            alert('You can only create a quotation when the design is confirmed.');
        }
    };
    
    
    const handleCloseModal = () => {
        setShowModal(false);
        setQuotationItems([{ orderItemId: 1,  quotationId:'' ,itemName: '', price: '', quantity: '' }]);
        setNextItemId(2); 
    };

    const handleQuotationItemChange = (index, field, value) => {
        const newItems = [...quotationItems];
        newItems[index][field] = value;
        setQuotationItems(newItems);
    };

    const handleAddQuotationItem = () => {
        const newItem = {
            orderItemId: Date.now(), 
            itemName: '',
            price: '',
            quantity: ''
        };
        setQuotationItems([...quotationItems, newItem]);
    };

    const handleRemoveQuotationItem = (index) => {
        const newItems = quotationItems.filter((_, i) => i !== index);
        setQuotationItems(newItems);
    };

    const handleConfirmDesign = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/updateProductStatus.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productDetailId: productDetailId,
                    status: 'Confirm Design',
                }),
            });
    
            if (response.ok) {
                alert('Design confirmed successfully!');
                setStatus('Confirm Design');
                fetchProductDetail();  
            } else {
                throw new Error('Failed to confirm design');
            }
        } catch (error) {
            console.error('Error confirming design:', error);
            alert('Failed to confirm design. Please try again.');
        }
    };
    
    const handleEditDesign = async () => {
        try {
            const response = await fetch('http://localhost/saProject_api/updateProductStatus.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productDetailId: productDetailId,
                    status: 'Editing',
                }),
            });
    
            if (response.ok) {
                alert('Design status set to Editing');
                setStatus('Editing');
                fetchProductDetail();  
            } else {
                throw new Error('Failed to set status to Editing');
            }
        } catch (error) {
            console.error('Error setting design to editing:', error);
            alert('Failed to set status to editing. Please try again.');
        }
    };
    
    
    const handleSubmitQuotation = async () => {
        const quotationDate = new Date().toISOString().split('T')[0]; 
    
        for (let item of quotationItems) {
            if (!item.itemName || !item.price || !item.quantity) {
                alert('Please fill in all fields for all quotation items.');
                return;
            }
        }
    
        try {
            const modifiedproductDetailId = productDetailId.slice(1);
            const existingQuotationsCount = quotations.length;
            const quotationId = `Q${modifiedproductDetailId}0${existingQuotationsCount + 1}`;
    
            const modifiedQuotationId = quotationId.slice(1);
            const updatedQuotationItems = quotationItems.map((item, index) => ({
                ...item,
                orderItemId: `OI${modifiedQuotationId}0${index + 1}`, 
            }));
    
            const response = await fetch('http://localhost/saProject_api/createQuotation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productDetailId: productDetailId,
                    quotationId: quotationId,
                    quotationDate: quotationDate,
                    statusQuotation: 'Waiting for purchase order',
                    quotationItems: updatedQuotationItems.map(item => ({
                        orderItemId: item.orderItemId,
                        itemName: item.itemName,
                        pricePerUnit: parseFloat(item.price),
                        quantity: parseInt(item.quantity, 10),
                    })),
                }),
            });
    
            const responseData = await response.json();
    
            if (response.ok) {
                alert('Quotation created successfully!');
                setShowModal(false);
                setQuotationItems([{ orderItemId: '', quotationId: '', itemName: '', price: '', quantity: '' }]);
                fetchQuotations(); 
            } else {
                alert(`Failed to create quotation: ${responseData.error || 'Unknown error'}`);
            }
        } catch (error) {
            alert('An error occurred while creating the quotation. Please try again later.');
        }
    };
    
    

    
    if (product === null) return <div>Loading product details...</div>;

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
                <h2 className='productDetail'>Product Detail</h2>
                <div className='detail-pd'>
                    <div className='c1'>
                        <p className='c1-1'>Product ID : <span>{product.productDetailId}</span></p>
                        <p className='c1-1'>Title : <span>{product.title}</span></p>
                        <p className='c1-1'>Description :</p>
                        <p className='c1-2'>{product.description}</p>
                    </div>
                    <div className='c2'>
                        <p>Status : {product.status}</p>
                        <div className="button-container-status">
                            <button 
                                className='confirm-design-button' 
                                onClick={handleConfirmDesign}
                                disabled={status === 'Confirm Design'}
                            > Confirm Design
                            </button>
                            <button 
                                className='edit-design-button' 
                                onClick={handleEditDesign} 
                                disabled={status === 'Confirm Design'}
                            >
                                Edit Design
                            </button>
                        </div>
                        <p>Design Product Photo : </p>
                        <p className='link'> 
                            {product.productPhoto ? (
                                <a href={`http://localhost/saProject_api/${product.productPhoto}`} target="_blank" rel="noopener noreferrer">
                                    View Product Deisgn
                                </a>
                            ) : (
                                'No photo available'
                            )}
                        </p>
                    </div>
                </div>
                <h2 className='quotation'>Quotations</h2>
                <div className="quotation-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Quotation ID</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.length > 0 ?(
                            quotations.map((quotation) => (
                                <tr key={quotation.quotationId} onClick={() => navigate(`/quotation/${quotation.quotationId}`)}>
                                    <td>{quotation.quotationId}</td>
                                    <td>{quotation.quotationDate}</td>
                                </tr>
                            ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No Quotations found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <button className="create-quotation-button" onClick={handleShowModal}>Create New Quotation</button>
            </div>
            {showModal && (
                <div className="modal-Q">
                    <div className="modal-content-Q">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2 className='createNewQuotation' >Create New Quotation</h2>
                        <div className="quotation-items-container">
                            <div className='quotation-item'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotationItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        placeholder="Name Item"
                                                        value={item.itemName}
                                                        onChange={(e) => handleQuotationItemChange(index, 'itemName', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        placeholder="Price"
                                                        value={item.price}
                                                        onChange={(e) => handleQuotationItemChange(index, 'price', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        placeholder="Quantity"
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuotationItemChange(index, 'quantity', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <button onClick={() => handleRemoveQuotationItem(index)}>X</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <button className='add-item' onClick={handleAddQuotationItem}>Add Item</button>
                        <div className="button-container">
                            <button className='submit-Q' onClick={handleSubmitQuotation}>Submit Quotation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;