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

    $paymentId = isset($_GET['paymentId']) ? $conn->real_escape_string($_GET['paymentId']) : '';
    if (empty($paymentId)) {
        die('Invalid Payment ID');
    }

    $sql = "SELECT purchaseOrderId , paymentDateTime FROM Payment WHERE paymentId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $paymentId);
    $stmt->execute();
    $result = $stmt->get_result();
    $paymentData = $result->fetch_assoc();

    if (!$paymentData) {
        die('No delivery data found for this ID');
    }

    $purchaseOrderId = $paymentData['purchaseOrderId'];
    $paymentDateTime = $paymentData['paymentDateTime'];

    $sql = "
        SELECT q.quotationId 
        FROM Payment p
        JOIN PurchaseOrder po ON p.purchaseOrderId = po.purchaseOrderId
        JOIN Quotation q ON po.quotationId = q.quotationId
        WHERE p.paymentId = ? OR p.purchaseOrderId = ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $paymentId, $purchaseOrderId);
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
    $pdf->Cell(190, 10, 'Receipt', 0, 1, 'C');
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
    $pdf->Cell(95, 10, 'NO. ' . $quotation['quotationId'], 0, 1, 'R');


    $pdf->SetFont('Arial', '', 10);
    $pdf->Cell(95, 5, $quotation['customerName'], 0, 0);
    $pdf->Cell(95, 5, 'Date: ' . $quotation['quotationDate'], 0, 1, 'R'); 
    $pdf->Cell(95, 5, $quotation['customerAddress'], 0, 1);
    $pdf->Cell(95, 5, 'Phone: ' . $quotation['customerPhone'], 0, 1);
    $pdf->Cell(95, 5, 'Email: ' . $quotation['customerEmail'], 0, 1);
    $pdf->Cell(95, 5, 'Tax ID: ' . $quotation['customerTaxId'], 0, 1);



    
    $pdf->Ln(5);
    
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(40, 10, '   Item', 1);
    $pdf->Cell(60, 10, '   Description', 1);
    $pdf->Cell(30, 10, 'Quantity', 1, 0, 'C');
    $pdf->Cell(30, 10, 'Price', 1, 0, 'C');
    $pdf->Cell(30, 10, 'Amount', 1, 0, 'C');
    $pdf->Ln();
    
    $pdf->SetFont('Arial', '', 12);
    $totalAmount = 0;
    $rowCount = 0; 
    $maxRows = 10; 
    
    foreach ($items as $item) {
        $amount = $item['quantity'] * $item['pricePerUnit'];
        $totalAmount += $amount;
    
        $pdf->Cell(40, 9, '   ' . $item['orderItemId'], 1, 0); 
        $pdf->Cell(60, 9, '   ' . $item['itemName'], 1, 0); 
        $pdf->Cell(30, 9, $item['quantity'], 1, 0, 'C'); 
        $pdf->Cell(30, 9, number_format($item['pricePerUnit'], 2), 1, 0, 'C'); 
        $pdf->Cell(30, 9, number_format($amount, 2), 1, 1, 'C');
        $rowCount++;
    }
    
    $emptyRows = $maxRows - $rowCount;
    for ($i = 0; $i < $emptyRows; $i++) {
        $pdf->Cell(40, 9, '', 1, 0); 
        $pdf->Cell(60, 9, '', 1, 0); 
        $pdf->Cell(30, 9, '', 1, 0, 'C'); 
        $pdf->Cell(30, 9, '', 1, 0, 'C'); 
        $pdf->Cell(30, 9, '', 1, 1, 'C');
    }


    $vat = $totalAmount * 0.07; 
    $withholdingTax = $totalAmount * 0.01;
    $grandTotal = $totalAmount + $vat - $withholdingTax;

    $pdf->Ln(5);
    $pdf->SetFont('Arial', '', 10);

    $pdf->Cell(140, 10, 'Subtotal', 1);
    $pdf->Cell(50, 10, number_format($totalAmount, 2), 1, 1, 'C');

    $pdf->Cell(140, 10, 'Value Added Tax (7%)', 1);
    $pdf->Cell(50, 10, number_format($vat, 2), 1, 1, 'C');

    $pdf->Cell(140, 10, 'Withholding Tax (1%)', 1);
    $pdf->Cell(50, 10, '-' . number_format($withholdingTax, 2), 1, 1, 'C');

    $pdf->SetFont('Arial', 'B', 10);
    $pdf->Cell(140, 10, 'Grand Total', 1);
    $pdf->Cell(50, 10, number_format($grandTotal, 2), 1, 1, 'C');


    ob_end_clean();
    $pdf->Output('D', "receipt_$paymentId.pdf"); 
    
    $conn->close();
?>
