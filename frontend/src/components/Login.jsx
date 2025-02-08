import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

function Login() {
    const navigate = useNavigate();
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const handleInputChange = (e, type) => {
        setError("");
        if (type === "user") {
            setUser(e.target.value);
            if (e.target.value === "") {
                setError("Username has been left blank");
            }
        } else if (type === "pass") {
            setPass(e.target.value);
            if (e.target.value === "") {
                setError("Password has been left blank");
            }
        }
    }

    const loginSubmit = () => {
        if (user !== "" && pass !== "") {
            const url = "http://localhost/backend/login.php";
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json"
            };
            const data = {
                username: user,
                password: pass
            };

            fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(response => {
                console.log(response);
                if (response[0].result === "Loggedin successfully! Redirecting...") {
                    setMsg(response[0].result);

                    localStorage.setItem('username', user);

                    const userRole = response[0].role; 

                    setTimeout(() => {
                        if (userRole === "Administrator") {
                            navigate("/createEmployee");
                        } 
                        else if (userRole === "Sales Staff") {
                            navigate("/home");
                        }
                        else if (userRole === "Designer") {
                            navigate("/allProductDesign");
                        }
                    }, 500);
                } else {
                    setError(response[0].result);
                }
            })
            .catch(err => {
                setError("An error occurred");
                console.error(err);
            });
        } else {
            setError("All fields are required");
        }
    }

    return (
        <div className="home-container">
                <div className='form'>
                    <h2>Login</h2>
                    <label>Username</label>
                    <input 
                        type="text"
                        className='userInput'
                        value={user}
                        onChange={(e) => handleInputChange(e, "user")}
                    />
                    <label>Password</label>
                    <input 
                        type="password"
                        className='passInput' 
                        value={pass}
                        onChange={(e) => handleInputChange(e, "pass")}
                    />
                    <p className='blue'>
                        {error ? <span className='error'>{error}</span> : <span className='success'>{msg}</span>}
                    </p>
                    <button 
                        type="button"
                        className='button'
                        onClick={loginSubmit}
                    >
                        Login
                    </button>
                </div>
        </div>
    );
}

export default Login;
