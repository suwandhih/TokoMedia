<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tokomedia</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f8;
      margin: 0;
      padding: 2rem;
      display: flex;
      justify-content: center;
    }

    .container {
      background-color: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .info-group {
      margin-bottom: 1.5rem;
    }

    .label {
      font-weight: bold;
      color: #333;
    }

    .value {
      margin-top: 0.25rem;
      color: #555;
    }
  </style>
</head>

<body>

  <div class="container">
    <div class="info-group">
      <div class="label">Full Name:</div>
      <div class="value"><?php echo $full_name; ?></div>
    </div>
    <div class="info-group">
      <div class="label">Email:</div>
      <div class="value"><?php echo $email; ?></div>
    </div>
    <div class="info-group">
      <div class="label">Message:</div>
      <div class="value"><?php echo $message; ?></div>
    </div>
  </div>

</body>

</html>