<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/pdf');

require('fpdf186/fpdf.php');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "projectSA";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$deliveryId = isset($_GET['deliveryId']) ? $conn->real_escape_string($_GET['deliveryId']) : '';
if (empty($deliveryId)) {
    die('Invalid Delivery ID');
}

$sql = "SELECT purchaseOrderId FROM Delivery WHERE deliveryId = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $deliveryId);
$stmt->execute();
$result = $stmt->get_result();
$deliveryData = $result->fetch_assoc();

if (!$deliveryData) {
    die('No delivery data found for this ID');
}

$purchaseOrderId = $deliveryData['purchaseOrderId'];

$sql = "
    SELECT q.quotationId 
    FROM Delivery d
    JOIN PurchaseOrder po ON d.purchaseOrderId = po.purchaseOrderId
    JOIN Quotation q ON po.quotationId = q.quotationId
    WHERE d.deliveryId = ? OR d.purchaseOrderId = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $deliveryId, $purchaseOrderId);
$stmt->execute();
$result = $stmt->get_result();
$quotation = $result->fetch_assoc();

if (!$quotation) {
    die('No matching quotation found');
}

$quotationId = $quotation['quotationId'];

$sql = "
    SELECT q.quotationId, q.quotationDate, c.customerTaxId, c.name AS customerName, 
           c.phone AS customerPhone, c.email AS customerEmail, c.address AS customerAddress
    FROM Quotation q
    JOIN ProductDetails pd ON q.productDetailId = pd.productDetailId
    JOIN Customer c ON pd.customerTaxId = c.customerTaxId
    WHERE q.quotationId = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $quotationId);
$stmt->execute();
$result = $stmt->get_result();
$quotation = $result->fetch_assoc();

if (!$quotation) {
    die('Quotation not found');
}

$sql_items = "SELECT * FROM OrderItem WHERE quotationId = ?";
$stmt_items = $conn->prepare($sql_items);
$stmt_items->bind_param("s", $quotationId);
$stmt_items->execute();
$result_items = $stmt_items->get_result();
$items = $result_items->fetch_all(MYSQLI_ASSOC);

$pdf = new FPDF();
$pdf->AddPage();

$pdf->SetFont('Arial', 'B', 20);
$pdf->Cell(190, 10, 'Delivery Note', 0, 1, 'C');
$pdf->Ln(4);

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(50, 10, 'Issuer', 0, 1);
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(50, 5, 'Smart Fact Ordinary Partnership', 0, 1);
$pdf->Cell(50, 5, '44/139 Soi Pracha Uthit 5/1, Pracha Uthit RD, Donmuang', 0, 1);
$pdf->Cell(50, 5, 'Donmuang, Bangkok 10210 Thailand', 0, 1);
$pdf->Cell(50, 5, 'Phone: 0958765448', 0, 1);
$pdf->Cell(50, 5, 'Email: smart-fact@outlook.co.th', 0, 1);
$pdf->Cell(50, 5, 'Tax ID: 09920039955790', 0, 1);
$pdf->Ln(4);
$pdf->Cell(190, 0, '', 1, 1);
$pdf->Ln(4);

$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(95, 10, 'Customer', 0, 0);
$pdf->Cell(95, 10, 'NO. ' . $deliveryId, 0, 1, 'R');

$pdf->SetFont('Arial', '', 10);
$pdf->Cell(95, 5, $quotation['customerName'], 0, 0);
$pdf->Cell(95, 5, 'Date: ' . $quotation['quotationDate'], 0, 1, 'R'); 
$pdf->Cell(95, 5, $quotation['customerAddress'], 0, 1);
$pdf->Cell(95, 5, 'Phone: ' . $quotation['customerPhone'], 0, 1);
$pdf->Cell(95, 5, 'Email: ' . $quotation['customerEmail'], 0, 1);
$pdf->Cell(95, 5, 'Tax ID: ' . $quotation['customerTaxId'], 0, 1);

$pdf->Ln(5);
$pdf->SetFont('Arial', 'B', 12);

$pdf->Cell(50, 10, '   Item', 1);
$pdf->Cell(100, 10, '   Description', 1);
$pdf->Cell(40, 10, 'Quantity', 1, 0, 'C');
$pdf->Ln();

$pdf->SetFont('Arial', '', 12);
$totalAmount = 0;

foreach ($items as $item) {
    $pdf->Cell(50, 9, '   ' . $item['orderItemId'], 1, 0); 
    $pdf->Cell(100, 9, '   ' . $item['itemName'], 1, 0); 
    $pdf->Cell(40, 9, $item['quantity'], 1, 0, 'C'); 
    $pdf->Ln();
}

$maxRows = 10;
$rowCount = count($items);
$emptyRows = $maxRows - $rowCount;

for ($i = 0; $i < $emptyRows; $i++) {
    $pdf->Cell(50, 9, '', 1, 0); 
    $pdf->Cell(100, 9, '', 1, 0); 
    $pdf->Cell(40, 9, '', 1, 0); 
    $pdf->Ln();
}

$pdf->Ln(5);
$pdf->Cell(190, 20, 'Remark', 1, 1);


$pdf->Ln(5);

$pdf->Cell(130, 10, 'Signature Receiver', 0, 0, 'R'); 
$pdf->Cell(50, 10, 'Signature Sender', 0, 1, 'R'); 

$pdf->Cell(130, 20, '.......................', 0, 0, 'R'); 
$pdf->Cell(50, 20, '.......................', 0, 1, 'R'); 

$pdf->Output('D', "delivery_note_$deliveryId.pdf"); 

$conn->close();
?>
