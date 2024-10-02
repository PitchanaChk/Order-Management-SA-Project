import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/productDetail.css';
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';

const ProductDetail = () => {
    const { productDetailId } = useParams(); 
    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState('');
    const [imageLink, setImageLink] = useState('');
    const [quotations, setQuotations] = useState([]);  
    const [showModal, setShowModal] = useState(false);
    const [quotationItems, setQuotationItems] = useState([{ orderItemId: '', quotationId:'' ,itemName: '', price: '', quantity: '' }]); 
    const [newQuotation, setNewQuotation] = useState({
        itemName: '',
        pricePerUnit: '',
        quantity: ''
    });
    const [nextItemId, setNextItemId] = useState(2); 
    const navigate = useNavigate(); 

    useEffect(() => {
        fetchProductDetail();
        fetchQuotations();  
    }, [productDetailId]);

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

    const handleStatusChange = async (e) => {
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
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleImageLinkChange = (e) => {
        setImageLink(e.target.value);
    };

    const handleUploadImageLink = async () => {
        if (!imageLink) {
            alert('Please enter an image link.');
            return;
        }

        try {
            const response = await fetch('http://localhost/saProject_api/uploadProductImage.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productDetailId: productDetailId,
                    productPhoto: imageLink,
                }),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to update image link');
            }

            console.log('Image link updated successfully');
            fetchProductDetail(); 
        } catch (error) {
            console.error('Error updating image link:', error);
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
    
    const handleSubmitQuotation = async () => {
        const quotationDate = new Date().toISOString().split('T')[0]; 
    
        for (let item of quotationItems) {
            if (!item.itemName || !item.price || !item.quantity) {
                alert('Please fill in all fields for all quotation items.');
                return;
            }
        }
    
        try {
            const response = await fetch('http://localhost/saProject_api/createQuotation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productDetailId: productDetailId,
                    quotationDate: quotationDate,
                    quotationItems: quotationItems.map(item => ({
                        orderItemId: item.orderItemId,  
                        itemName: item.itemName,
                        pricePerUnit: parseFloat(item.price),  
                        quantity: parseInt(item.quantity, 10)  
                    })),
                }),
            });
    
            const responseData = await response.json();
    
            if (response.ok) {
                alert('Quotation created successfully!');
                setShowModal(false);
                setQuotationItems([{ orderItemId: Date.now(), quotationId: '', itemName: '', price: '', quantity: '' }]); // Reset form
                fetchQuotations(); // Refresh the list of quotations
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
            <div className="top-bar-no-search"></div>
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
                        <p>Status : 
                            <select className='statusPdDropdown' value={status} onChange={handleStatusChange}>
                                <option value="Ready to Design">Ready to Design</option>
                                <option value="Designing">Designing</option>
                                <option value="Completed">Completed</option>
                                <option value="Editing">Editing</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </p>
                        <p>Design Product Photo : </p>
                        <p className='link'> 
                            {product.productPhoto ? (
                                <a href={product.productPhoto} target="_blank" rel="noopener noreferrer">{product.productPhoto}</a>
                            ) : (
                                'No photo available'
                            )}
                        </p>
                        <input
                            className='linkPhotoInput'
                            type="text"
                            value={imageLink}
                            onChange={handleImageLinkChange}
                            placeholder="Enter image link"
                        />
                        <button className='uploadButton' onClick={handleUploadImageLink}>Upload</button>
                    </div>
                </div>
                <h2 className='quotation'>Quotations</h2>
                <div className="quotation-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Quotation ID</th>
                                <th>Quotation Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.length > 0 ?(
                            quotations.map((quotation) => (
                                <tr key={quotation.quotationId}>
                                    <td>{quotation.quotationId}</td>
                                    <td>{quotation.quotationDate}</td>
                                </tr>
                            ))
                            ) : (
                                <tr>
                                    <td colSpan="2">No Quotations found.</td>
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
                        <h3 className='orderItem' >Order item</h3>
                        <div className="quotation-items-container">
                            {quotationItems.map((item, index) => (
                                <div key={item.id} className="quotation-item"> 
                                    <input
                                        type="text"
                                        placeholder="Name Item"
                                        value={item.itemName}
                                        onChange={(e) => handleQuotationItemChange(index, 'itemName', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={item.price}
                                        onChange={(e) => handleQuotationItemChange(index, 'price', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={item.quantity}
                                        onChange={(e) => handleQuotationItemChange(index, 'quantity', e.target.value)}
                                    />
                                </div>
                            ))}
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