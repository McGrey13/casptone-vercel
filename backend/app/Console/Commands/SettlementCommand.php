<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SettlementProcessorJob;

class SettlementCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'revenue:settle';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process settlement periods and scheduled payouts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting settlement processing...');
        
        try {
            // Dispatch the settlement processor job
            SettlementProcessorJob::dispatch();
            
            $this->info('Settlement processor job dispatched successfully.');
            $this->info('Check the logs for settlement processing results.');
            
        } catch (\Exception $e) {
            $this->error('Failed to dispatch settlement processor job: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
