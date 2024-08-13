const successPage = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            background-color: #FFFFFF;
        }

        .container {
            text-align: center;
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .container h1 {
            color: #4CAF50;
            font-size: 36px;
            margin-bottom: 20px;
        }

        .container p {
            color: #555;
            font-size: 18px;
            margin-bottom: 40px;
        }

        .container button {
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #4CAF50;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .container button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Payment Successful</h1>
        <p>Thank you for your payment. Your transaction has been completed successfully.</p>
       
    </div>
</body>
</html>
`;
};
const failedPage = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            background-color: #FFFFFF;
        }

        .container {
            text-align: center;
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .container h1 {
            color: #f44336;
            font-size: 36px;
            margin-bottom: 20px;
        }

        .container p {
            color: #555;
            font-size: 18px;
            margin-bottom: 40px;
        }

        .container button {
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #f44336;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .container button:hover {
            background-color: #e53935;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Payment Failed</h1>
        <p>We’re sorry, but your payment could not be processed. Please try again.</p>
       
    </div>
</body>
</html>
`;
};
module.exports = {
  successPage,
  failedPage,
};
