<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillOrderNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:backfill-order-numbers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill order numbers for orders that don\'t have them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting to backfill order numbers...');

        // Get all orders without order_number
        $ordersWithoutNumber = Order::whereNull('order_number')->get();

        if ($ordersWithoutNumber->isEmpty()) {
            $this->info('✅ All orders already have order numbers!');
            return 0;
        }

        $this->info("📦 Found {$ordersWithoutNumber->count()} orders without order numbers");

        $bar = $this->output->createProgressBar($ordersWithoutNumber->count());
        $bar->start();

        foreach ($ordersWithoutNumber as $order) {
            // Generate order number based on order creation date
            $orderNumber = $this->generateOrderNumber($order->created_at);
            
            // Update the order
            $order->update(['order_number' => $orderNumber]);
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('✅ Successfully backfilled all order numbers!');
        $this->info('📊 Format: ORD-YYYYMMDD-XXXXXX');
        
        return 0;
    }

    /**
     * Generate unique order number
     * Format: ORD-YYYYMMDD-XXXXXX
     */
    private function generateOrderNumber($date)
    {
        do {
            $dateCode = $date->format('Ymd');
            $random = strtoupper(substr(md5(uniqid()), 0, 6));
            $orderNumber = 'ORD-' . $dateCode . '-' . $random;
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}

