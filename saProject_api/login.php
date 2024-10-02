<?php
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type");

    $conn = new mysqli("localhost", "root", "", "projectSA");

    if ($conn->connect_error) {
        echo json_encode(array("result" => "Database connection failed: " . $conn->connect_error));
        exit();
    }

    $eData = file_get_contents("php://input");
    $dData = json_decode($eData, true);

    if ($dData === null) {
        echo json_encode(array("result" => "Failed to decode JSON"));
        exit();
    }

    $user = $dData['username'];
    $pass = $dData['password'];
    $result = "";

    if (!empty($user) && !empty($pass)) {
        $sql = $conn->prepare("SELECT * FROM Employee WHERE username = ? AND password = ?");
        $sql->bind_param("ss", $user, $pass);
        $sql->execute();
        $res = $sql->get_result();

        if ($res->num_rows > 0) {
            $row = $res->fetch_assoc();
            if ($pass !== $row['password']) {
                $result = "Invalid password";
            } else {
                $result = "Loggedin successfully! Redirecting...";
            }
        } else {
            $result = "Invalid username or Invalid password";
        }
    } else {
        $result = "Username and password are required";
    }

    $conn->close();
    $response[] = array("result" => $result);
    echo json_encode($response);
?>
