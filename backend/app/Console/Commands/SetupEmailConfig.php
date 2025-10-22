<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SetupEmailConfig extends Command
{
    protected $signature = 'email:setup';
    protected $description = 'Setup email configuration for local development';

    public function handle()
    {
        $envPath = base_path('.env');
        
        if (!File::exists($envPath)) {
            $this->error('.env file not found!');
            return 1;
        }

        $envContent = File::get($envPath);
        
        // Update mail configuration
        $replacements = [
            'MAIL_MAILER=smtp' => 'MAIL_MAILER=smtp',
            'MAIL_HOST=127.0.0.1' => 'MAIL_HOST=mailpit',
            'MAIL_PORT=2525' => 'MAIL_PORT=1025',
            'MAIL_USERNAME=null' => 'MAIL_USERNAME=null',
            'MAIL_PASSWORD=null' => 'MAIL_PASSWORD=null',
            'MAIL_ENCRYPTION=null' => 'MAIL_ENCRYPTION=null',
            'MAIL_FROM_ADDRESS="hello@example.com"' => 'MAIL_FROM_ADDRESS="noreply@craftconnect.test"',
            'MAIL_FROM_NAME="Laravel"' => 'MAIL_FROM_NAME="CraftConnect"',
        ];

        foreach ($replacements as $search => $replace) {
            $envContent = preg_replace("/^" . preg_quote($search, '/') . "/m", $replace, $envContent, -1, $count);
            if ($count > 0) {
                $this->info("Updated: $search → $replace");
            }
        }

        File::put($envPath, $envContent);
        
        $this->info('Email configuration updated successfully!');
        $this->info('Please restart your server for the changes to take effect.');
        
        return 0;
    }
}
