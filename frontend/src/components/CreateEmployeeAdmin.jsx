import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/createEmployee.css'; 
import homeIcon from '../image/home.png';
import logoutIcon from '../image/logout.png';


const CreateEmployeeAdmin = () => {
    const [employees, setEmployees] = useState([]);
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [profileName, setProfileName] = useState('');
    const navigate = useNavigate(); 
    const [showModal, setShowModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        phone: '',
        address: '',
        role: '',
        username: '',
        password: ''
    });
    const roles = ['Administrator', 'Sales Staff', 'Designer'];

    useEffect(() => {
        fetchEmplyees();
        fetchProfile();

        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setProfileName(storedUsername);
        }
    }, []);

    const fetchEmplyees = async () => {
        try {
            const response = await fetch('http://localhost/backend/getTableEmployees.php');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const username = localStorage.getItem('username'); 
            const response = await fetch(`http://localhost/backend/getProfileEmployee.php?username=${username}`, {
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
    

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchId(value);
        setSearchName(value);
    };

    const filteredEmployee = employees.filter(employees =>
        employees.employeeId.includes(searchId) || employees.name.toLowerCase().includes(searchName.toLowerCase())
    );
    

    const handleToHome = () => {
        navigate('/createEmployee');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
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
    
        if (name === 'phone' && value.length > 10) {
            return; 
        }
    
        setNewEmployee(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    

    const handleCreateEmployee = async () => {
        const { name, phone, address, role, username, password } = newEmployee;
    
        if (!name || !phone || !address || !role || !username || !password) {
            alert('Please fill in all fields before submitting');
            return;
        }
    
        const isUsernameTaken = employees.some(employee => employee.username === username);
        if (isUsernameTaken) {
            alert('Username is already taken. Please choose another one.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost/backend/createEmployees.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEmployee),
            });
    
            if (response.ok) {
                alert('Employee created successfully!');
                fetchEmplyees(); 
                setNewEmployee({
                    name: '',
                    phone: '',
                    address: '',
                    role: '',
                    username: '',
                    password: ''
                });
                setShowModal(false);
            } else {
                alert('Failed to create employee');
            }
        } catch (error) {
            console.error('Error creating employee:', error);
        }
    };
    
    
    
    return (
        <div className="home-container">
            <div className="top-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search Employee ID or Name"
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
                <button className="toHome" onClick={handleToHome}>
                    <img src={homeIcon} className="icon" alt="Home Icon" />
                    Home
                </button>
                <button className="logout-button-admin" onClick={handleLogout}>
                    <img src={logoutIcon} className="icon" alt="Logout Icon" />
                    Log Out
                </button>
            </div>
            <div className="content">
                <div className="home-page">
                    <label className="labelEmployee">Employees</label>
                    <div className="employees-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Role</th>
                                    <th>Username</th>
                                    <th>Password</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployee.length > 0 ? (
                                    filteredEmployee.map((employees) => (
                                        <tr>
                                            <td>{employees.employeeId}</td>
                                            <td>{employees.name}</td>
                                            <td>{employees.phone}</td>
                                            <td>{employees.address}</td>
                                            <td>{employees.role}</td>
                                            <td>{employees.username}</td>
                                            <td>{employees.password}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">No employees found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button className="create-button" onClick={handleShowModal}>Create New Employee</button>
                </div>
            </div>
            {showModal && (
                <div className="modal-create-employee">
                    <div className="modal-content-create-employee">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2 className='createNewEmployee'>Create New Employee</h2>
                        <div className='newEmployeeText'>Name</div>
                        <form>
                            <input 
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={newEmployee.name}
                                onChange={handleInputChange}
                                className="newEmployeeInput"
                            />
                        </form>
                        <div className='newEmployeeText'>Phone</div>
                        <form>
                            <input 
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={newEmployee.phone}
                                onChange={handleInputChange}
                                className="newEmployeeInput"
                            />
                        </form>
                        <div className='newEmployeeText'>Address</div>
                        <form>
                            <input 
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={newEmployee.address}
                                onChange={handleInputChange}
                                className="newEmployeeInput"
                            />
                        </form>
                        <div className='newEmployeeText'>Role</div>
                        <form>
                            <select 
                                name="role"
                                value={newEmployee.role}
                                onChange={handleInputChange}
                                className="newEmployeeInput"
                            >
                                <option value="">Select Role</option>
                                {roles.map((role, index) => (
                                    <option key={index} value={role}>{role}</option>
                                ))}
                            </select>
                        </form>
                        <div className='newEmployeeText'>Username</div>
                        <form>
                            <input 
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={newEmployee.username}
                                onChange={handleInputChange}
                                className="newEmployeeInput"
                            />
                        </form>
                        <div className='newEmployeeText'>Password</div>
                        <form>
                            <input 
                                type="text"
                                name="password"
                                placeholder="Password"
                                value={newEmployee.password}
                                onChange={handleInputChange}
                                className="newEmployeeInput"
                            />
                            <button type="button" onClick={handleCreateEmployee}>Submit</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CreateEmployeeAdmin;
