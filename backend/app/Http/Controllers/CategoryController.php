<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Get all categories
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $categories = Category::all();
            
            // Transform the categories to have consistent naming
            $transformedCategories = $categories->map(function($category) {
                return [
                    'id' => $category->id,
                    'category_name' => $category->CategoryName,
                    'category_id' => strtolower(str_replace([' ', '&', '/'], ['-', '', '-'], $category->CategoryName)),
                ];
            });
            
            return response()->json([
                'status' => 'success',
                'data' => $transformedCategories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch categories',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
