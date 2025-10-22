<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ImageController extends Controller
{
    public function serve(Request $request, $path)
    {
        $filePath = storage_path('app/public/' . $path);
        
        if (!file_exists($filePath)) {
            abort(404, 'Image not found');
        }
        
        $mimeType = mime_content_type($filePath);
        
        $response = new Response(file_get_contents($filePath));
        $response->header('Content-Type', $mimeType);
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type');
        $response->header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        return $response;
    }
    
    public function handleOptions(Request $request)
    {
        return response('', 200, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type',
        ]);
    }
}
