<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Models\SellerBalance;
use App\Models\Payout;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class SettlementProcessorJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Starting settlement processor job');

            // Move pending balances to available balances for transactions older than 7 days
            $this->processSettlementPeriod();

            Log::info('Settlement processor job completed successfully');

        } catch (\Exception $e) {
            Log::error('Settlement processor job failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Process settlement period - move pending to available
     */
    private function processSettlementPeriod(): void
    {
        try {
            // Get transactions that are 7+ days old and still in pending balance
            $settlementDate = now()->subDays(7);
            
            $transactions = Transaction::where('status', 'succeeded')
                ->where('created_at', '<=', $settlementDate)
                ->get();

            $totalMoved = 0;
            $sellersProcessed = [];

            foreach ($transactions as $transaction) {
                $sellerId = $transaction->seller_id;
                
                if (in_array($sellerId, $sellersProcessed)) {
                    continue; // Already processed this seller
                }

                $balance = SellerBalance::where('seller_id', $sellerId)->first();
                
                if ($balance && $balance->pending_balance > 0) {
                    // Move all pending balance to available
                    $amountToMove = $balance->pending_balance;
                    $balance->movePendingToAvailable($amountToMove);
                    
                    $totalMoved += $amountToMove;
                    $sellersProcessed[] = $sellerId;

                    Log::info('Moved pending balance to available', [
                        'seller_id' => $sellerId,
                        'amount_moved' => $amountToMove / 100
                    ]);
                }
            }

            if ($totalMoved > 0) {
                Log::info('Settlement period processing completed', [
                    'total_amount_moved' => $totalMoved / 100,
                    'sellers_processed' => count($sellersProcessed)
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to process settlement period', [
                'error' => $e->getMessage()
            ]);
        }
    }

}
