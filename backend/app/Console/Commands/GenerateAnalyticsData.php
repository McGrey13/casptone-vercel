<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\AnalyticsController;
use Carbon\Carbon;

class GenerateAnalyticsData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analytics:generate {--days=30 : Number of days to generate data for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate analytics data for the specified number of days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $this->info("Generating analytics data for the last {$days} days...");

        $analyticsController = new AnalyticsController();
        
        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::now()->subDays($i);
            
            // Generate daily data
            $request = new \Illuminate\Http\Request();
            $request->merge([
                'date' => $date->toDateString(),
                'period_type' => 'daily'
            ]);
            
            try {
                $analyticsController->generateAnalyticsData($request);
                $this->info("Generated data for {$date->toDateString()}");
            } catch (\Exception $e) {
                $this->error("Failed to generate data for {$date->toDateString()}: " . $e->getMessage());
            }
        }

        // Generate monthly data for the current month
        $currentMonth = Carbon::now()->startOfMonth();
        $request = new \Illuminate\Http\Request();
        $request->merge([
            'date' => $currentMonth->toDateString(),
            'period_type' => 'monthly'
        ]);
        
        try {
            $analyticsController->generateAnalyticsData($request);
            $this->info("Generated monthly data for {$currentMonth->format('Y-m')}");
        } catch (\Exception $e) {
            $this->error("Failed to generate monthly data: " . $e->getMessage());
        }

        $this->info('Analytics data generation completed!');
    }
}
