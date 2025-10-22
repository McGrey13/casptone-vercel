<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\MicroAnalyticsDataSeeder;

class GenerateMicroAnalyticsData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analytics:generate-micro {--year=2024 : Starting year for data generation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate comprehensive micro analytics data for a full year (Sept 30, 2024 to Sept 30, 2025)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Micro Analytics Data Generation...');
        $this->info('This will generate data from Sept 30, 2024 to Sept 30, 2025');
        
        if ($this->confirm('This will generate a large amount of data. Continue?')) {
            $seeder = new MicroAnalyticsDataSeeder();
            $seeder->run();
            
            $this->info('Micro analytics data generation completed!');
            $this->info('You can now view detailed analytics in the admin dashboard.');
        } else {
            $this->info('Operation cancelled.');
        }
    }
}

