<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Seeder;
use Database\Seeders\CommissionDataSeeder;

echo "🌱 Seeding Commission Data...\n";
echo "================================\n";

try {
    // Run the commission data seeder
    $seeder = new CommissionDataSeeder();
    $seeder->run();
    
    echo "\n✅ Commission data seeded successfully!\n";
    echo "================================\n";
    echo "📊 Sample transactions with 2% commission have been created\n";
    echo "💰 Each item sold now has individual commission tracking\n";
    echo "📈 Admin can now view detailed commission reports\n";
    echo "================================\n";
    
} catch (Exception $e) {
    echo "\n❌ Error seeding commission data: " . $e->getMessage() . "\n";
    echo "================================\n";
}
