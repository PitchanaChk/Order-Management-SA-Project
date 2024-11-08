import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/home.css'; 
import '../styles/allProductDesign.css';
import designIcon from '../image/design.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';

const AllProductDesign = () => {
    const [profileName, setProfileName] = useState('');
    const [productDetails, setProductDetails] = useState([]);
    const [isUploading, setIsUploading] = useState(false); 
    const navigate = useNavigate(); 
    const { id } = useParams(); 

    useEffect(() => {
        fetchProductDetails();
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const username = localStorage.getItem('username'); 
            const response = await fetch(`http://localhost/saProject_api/getProfileEmployee.php?username=${username}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setProfileName(data[0].result.name); 
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchProductDetails = async () => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getTableAllProductDetails.php`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setProductDetails(data.map(product => ({
                ...product,
                imageLink: product.productPhoto ? `http://localhost/saProject_api/${product.productPhoto}` : null
            })));
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    /*const handleStatusChange = async (productDetailId, newStatus) => {
        try {
            const response = await fetch('http://localhost/saProject_api/updateProductStatus.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productDetailId,
                    status: newStatus,
                }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            setProductDetails(prevDetails =>
                prevDetails.map(product =>
                    product.productDetailId === productDetailId ? { ...product, status: newStatus } : product
                )
            );
            alert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };*/

    const handleFileChange = (productId, event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setProductDetails(prevDetails =>
                    prevDetails.map(product =>
                        product.productDetailId === productId
                            ? { ...product, validationError: 'File size must be less than 5MB.' }
                            : product
                    )
                );
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setProductDetails(prevDetails =>
                    prevDetails.map(product =>
                        product.productDetailId === productId
                            ? { ...product, validationError: 'Invalid file type. Please select a JPG, PNG, or PDF file.' }
                            : product
                    )
                );
                return;
            }
        }
        
        setProductDetails(prevDetails =>
            prevDetails.map(product =>
                product.productDetailId === productId 
                    ? { ...product, selectedFile: file, validationError: null }
                    : product
            )
        );
    };

    const handleUpload = async (productId) => {
        const product = productDetails.find(p => p.productDetailId === productId);
        const selectedFile = product.selectedFile;
    
        if (!selectedFile) {
            setProductDetails(prevDetails =>
                prevDetails.map(product =>
                    product.productDetailId === productId
                        ? { ...product, validationError: 'Please select a file before uploading.' }
                        : product
                )
            );
            return;
        }
    
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('productDetailId', productId);
    
            const response = await fetch('http://localhost/saProject_api/uploadFileDesign.php', {
                method: 'POST',
                body: formData
            });
    
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Server returned non-JSON response');
            }
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }
    
            if (data.status === 'success' && data.data?.image_link) {
                const imageLink = `http://localhost/saProject_api/${data.data.image_link}`;
                setProductDetails(prevDetails =>
                    prevDetails.map(product =>
                        product.productDetailId === productId
                            ? {
                                ...product,
                                imageLink: imageLink,
                                selectedFile: null,
                                validationError: null
                            }
                            : product
                    )
                );
                alert('File uploaded successfully!');
                await fetchProductDetails();
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setProductDetails(prevDetails =>
                prevDetails.map(product =>
                    product.productDetailId === productId
                        ? { ...product, validationError: `Upload failed: ${error.message}` }
                        : product
                )
            );
            alert('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
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
            <div className="top-bar-no-search">
                <div className="profile-info">
                    <span>{profileName}</span>
                </div>
            </div>
            <div className="sidebar">
                <button className="toDesign" onClick={handleToDesign}>
                    <img src={designIcon} className="icon" alt="Design Icon" />
                    Design
                </button>
                <button className="toOrder" onClick={handleToOrder}>
                    <img src={orderIcon} className="icon" alt="Order Icon" />
                    Order
                </button>
                <button className="toLogOut-design" onClick={handleLogout}>
                    <img src={logoutIcon} className="icon" alt="Logout Icon" />
                    Log Out
                </button>
            </div>
            <div className="content-dn">
                <h2 className='productDetails-Design'>Product Details</h2>
                <div className='productDetail-design-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Upload Design</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productDetails.length > 0 ? (
                                productDetails.map(product => (
                                    <tr key={product.productDetailId}>
                                        <td>{product.productDetailId}</td>
                                        <td>{product.title}</td>
                                        <td>{product.status}</td>
                                        <td>
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(product.productDetailId, e)}
                                                accept=".jpg,.jpeg,.png,.pdf"
                                            />
                                            <button 
                                                onClick={() => handleUpload(product.productDetailId)}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                            {product.validationError && (
                                                <p className="error" style={{ color: 'red' }}>
                                                    {product.validationError}
                                                </p>
                                            )}
                                            {product.imageLink && (
                                                <div>
                                                    <a 
                                                        href={product.imageLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="view-file-link"
                                                    >
                                                        View File
                                                    </a>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No product details found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllProductDesign;