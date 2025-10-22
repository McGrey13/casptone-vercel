<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\ReconciliationJob;

class ReconciliationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'revenue:reconcile';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run payment reconciliation to check for discrepancies between PayMongo and local records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting payment reconciliation...');
        
        try {
            // Dispatch the reconciliation job
            ReconciliationJob::dispatch();
            
            $this->info('Reconciliation job dispatched successfully.');
            $this->info('Check the logs for reconciliation results.');
            
        } catch (\Exception $e) {
            $this->error('Failed to dispatch reconciliation job: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
