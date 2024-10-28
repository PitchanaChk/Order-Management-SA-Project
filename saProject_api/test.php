<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require('fpdf186/fpdf.php');

// Create PDF
$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 20);
$pdf->Cell(100, 20, 'Hello world', 1, 0, 'C');

// Output PDF
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="hello_world.pdf"');
$pdf->Output();
?>
