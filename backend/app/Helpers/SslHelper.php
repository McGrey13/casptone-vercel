<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SslHelper
{
    /**
     * Download and cache CA bundle for SSL verification
     */
    public static function downloadCaBundle()
    {
        $caBundlePath = storage_path('app/ssl/cacert.pem');
        $caBundleDir = dirname($caBundlePath);

        // Create directory if it doesn't exist
        if (!file_exists($caBundleDir)) {
            mkdir($caBundleDir, 0755, true);
        }

        // Download if file doesn't exist or is older than 30 days
        if (!file_exists($caBundlePath) || (time() - filemtime($caBundlePath)) > (30 * 24 * 60 * 60)) {
            try {
                $caBundleContent = file_get_contents('https://curl.se/ca/cacert.pem');
                if ($caBundleContent !== false) {
                    file_put_contents($caBundlePath, $caBundleContent);
                    Log::info('CA bundle downloaded successfully', ['path' => $caBundlePath]);
                } else {
                    Log::error('Failed to download CA bundle');
                    return false;
                }
            } catch (\Exception $e) {
                Log::error('Exception downloading CA bundle: ' . $e->getMessage());
                return false;
            }
        }

        return $caBundlePath;
    }

    /**
     * Get SSL options for HTTP client based on environment
     */
    public static function getSslOptions()
    {
        if (env('APP_ENV') === 'local' || env('APP_ENV') === 'development') {
            return [
                'verify' => false,
                'timeout' => 30,
            ];
        }

        // For production, try to use CA bundle
        $caBundlePath = self::downloadCaBundle();
        
        if ($caBundlePath && file_exists($caBundlePath)) {
            return [
                'verify' => $caBundlePath,
                'timeout' => 30,
            ];
        }

        // Fallback for production if CA bundle fails
        return [
            'verify' => false, // This is not ideal for production
            'timeout' => 30,
        ];
    }
}

