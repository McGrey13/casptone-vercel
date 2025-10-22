<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TokenService;

class CleanExpiredTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:clean';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean expired tokens from the database';

    protected $tokenService;

    public function __construct(TokenService $tokenService)
    {
        parent::__construct();
        $this->tokenService = $tokenService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning expired tokens...');
        
        $deletedCount = $this->tokenService->cleanExpiredTokens();
        
        $this->info("Cleaned {$deletedCount} expired tokens.");
        
        return Command::SUCCESS;
    }
}
