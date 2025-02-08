<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";   
$password = "";       
$dbname = "projectSA"; 

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (isset($_GET['customerTaxId'])) {
        $customerTaxId = $_GET['customerTaxId'];

        $stmt = $pdo->prepare("SELECT productDetailId, title, status FROM ProductDetails WHERE customerTaxId = :customerTaxId");
        $stmt->bindParam(':customerTaxId', $customerTaxId, PDO::PARAM_INT);
        
        $stmt->execute();

        $productDetails = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($productDetails);
    } else {
        echo json_encode(["error" => "customerTaxId parameter is missing."]);
    }

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
