<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "🔍 Testing Commission API...\n";
echo "============================\n";

try {
    // Bootstrap Laravel
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    // Get admin user
    $adminUser = User::where('role', 'administrator')->first();
    
    if (!$adminUser) {
        echo "❌ No admin user found. Please run the seeder first.\n";
        exit(1);
    }

    echo "✅ Found admin user: {$adminUser->userName}\n";
    echo "📧 Email: {$adminUser->userEmail}\n";

    // Create token
    $token = $adminUser->createToken('commission-test-token')->plainTextToken;
    echo "🔑 Token created: " . substr($token, 0, 20) . "...\n";

    // Test API endpoint
    $baseURL = 'http://localhost:8000';
    $endpoint = '/api/admin/reports/system-commission?from_date=2025-09-01&to_date=2025-10-06';
    
    echo "\n🌐 Testing API endpoint: {$baseURL}{$endpoint}\n";
    
    $headers = [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
        'Accept: application/json',
        'X-Requested-With: XMLHttpRequest'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseURL . $endpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    curl_close($ch);

    echo "📊 HTTP Status Code: {$httpCode}\n";
    
    if ($httpCode === 200) {
        echo "✅ API call successful!\n";
        $data = json_decode($body, true);
        if ($data && isset($data['data']['summary'])) {
            $summary = $data['data']['summary'];
            echo "💰 Total Revenue: ₱" . number_format($summary['total_gross_revenue'] ?? 0, 2) . "\n";
            echo "💵 Total Commission: ₱" . number_format($summary['total_admin_fees'] ?? 0, 2) . "\n";
            echo "📈 Transactions: " . ($summary['transaction_count'] ?? 0) . "\n";
        }
    } else {
        echo "❌ API call failed!\n";
        echo "Response: " . substr($body, 0, 500) . "\n";
    }

    echo "\n🎯 Use this token in your frontend:\n";
    echo "localStorage.setItem('token', '{$token}');\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n============================\n";
echo "✨ Test completed!\n";
