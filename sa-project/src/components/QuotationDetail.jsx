import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/quotationDetail.css'; 
import homeIcon from '../image/home.png';
import orderIcon from '../image/order.png';
import logoutIcon from '../image/logout.png';
import deliveryIcon from '../image/delivery.png';
import paymentIcon from '../image/payment.png';

const QuotationDetail = () => {
    const [profileName, setProfileName] = useState('');
    const { quotationId } = useParams();
    const [quotation, setQuotation] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageLink, setImageLink] = useState(() => localStorage.getItem(`imageLink_${quotationId}`)); // ดึงลิงก์จาก localStorage
    const [validationError, setValidationError] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchQuotationDetail();
    }, [quotationId]);

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

    const fetchQuotationDetail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/saProject_api/getQuotationDetail.php?quotationId=${quotationId}`);
            const data = await response.json();
            setQuotation(data);
        } catch (error) {
            console.error('Error fetching quotation details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToHome = () => navigate('/home');
    const handleToOrder = () => navigate('/order');
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        navigate('/', { replace: true });
    };
    const handleToDelivery = () => navigate('/delivery');
    const handleToPayment = () => navigate('/payment');

    const handleShowPdf = async () => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getQuotationPdf.php?quotationId=${quotationId}`, {
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
    
    const handleDownloadPdf = async () => {
        try {
            const response = await fetch(`http://localhost/saProject_api/getQuotationPdf.php?quotationId=${quotationId}`, {
                method: 'GET',
            });
    
            if (!response.ok) {
                throw new Error('Error downloading PDF');
            }
    
            const blob = await response.blob(); 
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quotation_${quotationId}.pdf`; 
            document.body.appendChild(a);
            a.click();
            a.remove(); 
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setValidationError('File size must be less than 5MB.');
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setValidationError('Invalid file type. Please select a JPG, PNG, or PDF file.');
                return;
            }
        }
        
        setSelectedFile(file);
        setValidationError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setValidationError('Please select a file before uploading.');
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('quotationId', quotation.quotationId);  
    
            const response = await fetch('http://localhost/saProject_api/createPurchaseOrder.php', {
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
    
            if (data.status === 'success' && data.data?.pdf_link) {
                const pdfLink = `http://localhost/saProject_api/${data.data.pdf_link}`;
                setImageLink(pdfLink);
                localStorage.setItem(`imageLink_${quotationId}`, pdfLink); // บันทึกลิงก์ลงใน localStorage
                setSelectedFile(null);
                setValidationError(null);
                alert('File uploaded successfully!');
                await fetchQuotationDetail(); 
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setValidationError(`Upload failed: ${error.message}`);
            alert('Failed to upload file. Please try again.');
        }
    };
    
    const handleViewImage = () => {
        if (imageLink) {
            window.open(imageLink, '_blank');
        } else {
            alert('No image uploaded yet.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!quotation) {
        return <div>Loading quotation details...</div>;
    }

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
                <h2 className='quotationDetail'>Quotation Details</h2>
                <div className="quotation-info">
                    <div className='c-1'>
                        <p className='c1-1'>Quotation ID: <span>{quotation.quotationId}</span></p>
                        <p className='c1-1'>Quotation Date: <span>{quotation.quotationDate}</span></p>
                        <p className='c2-q'>Status: <span>{quotation.statusQuotation}</span></p>
                    </div>
                    <div className="c2-2">
                        <h3>Upload Purchase Order</h3>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} />
                        <button onClick={handleUpload}>Upload</button>
                        {validationError && <p className="error">{validationError}</p>}
                        {imageLink ? (
                            <p>
                                <a 
                                    href={imageLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
                                >
                                    View Uploaded
                                </a>
                            </p>
                        ) : null}

                    </div>
                    <h3 className='items'>Items</h3>
                    <div className='item-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item ID</th>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map(item => (
                                    <tr key={item.orderItemId}>
                                        <td>{item.orderItemId}</td>
                                        <td>{item.itemName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.pricePerUnit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="show-pdf" onClick={handleShowPdf}>
                        Show PDF
                    </button>
                    <button className="download-pdf" onClick={handleDownloadPdf}>
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuotationDetail;
