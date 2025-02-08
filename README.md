# Order Management System for Machine Parts and Industrial Machines

## Project Overview
This project is an order management system for designing and ordering machine parts and industrial machines for a company. It was developed based on the principles of system analysis and design to improve work efficiency, reduce complexity, and eliminate errors in existing processes. Additionally, it aims to improve data management accuracy and streamline the process of designing and manufacturing machines.

## Key Features
- **Sales Staff Login System**: Allows sales staff to log in to access various functionalities within the system.
- **Customer Details Entry System**: Enables the entry of detailed customer information.
- **Product Details Entry System**: Manages and records information about products and machine parts to be manufactured.
- **Product Status Tracking System**: Tracks the production and delivery status of products.
- **Quotation Generation System**: Creates quotes for customers.
- **Shipping Invoice Creation System**: Generates shipping invoices once the product is ready for delivery.
- **Payment Verification System**: Checks the payment status from customers.
- **Receipt Generation System**: Creates receipts once payment is made by the customer.

## Importance
This system aims to:
1. Reduce the complexity and errors in the process of ordering and manufacturing machines and parts.
2. Improve work efficiency and streamline various business processes.
3. Enhance internal communication and reduce errors in the process.
4. Ensure accurate data management and improve tracking of product statuses.


## Installation

### 1. Setting Up XAMPP
This project uses MySQL with XAMPP, so you'll need to install XAMPP and set up MySQL:

- Download and install [XAMPP](https://www.apachefriends.org/)
- Open the XAMPP Control Panel and start Apache and MySQL
- Place the `backend` folder in the `htdocs` directory of XAMPP

### 2. Installing Dependencies
Inside `frontent` directories:

- Use the following command to install the necessary dependencies for Node.js:
  ```
  cd ../frontend
  npm install
  ```

### 3. Configuring Database Settings
In the `backend' , configure the database connection settings to match your MySQL setup:

```js
module.exports = {
  host: "localhost",
  user: "root",  // Database username
  password: "",  // Database password
  database: "your_database_name" // Your database name
};
```


### 4. Running the Project

- **Start the backend:**

  To run the backend, you need to start Apache and MySQL from the XAMPP control panel:
  1. Open the XAMPP Control Panel.
  2. Start **Apache** and **MySQL**.


- **Start the front-end web application:**
  In the `frontend` directory, run:
  ```
  cd frontend
  npm run dev
  ```

  The web application will be running on `http://localhost:8080`.
