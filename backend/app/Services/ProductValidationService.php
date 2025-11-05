<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ProductValidationService
{
    /**
     * Valid Laguna craft categories based on the study
     */
    private static $validLagunaCategories = [
        // Woodworking & Carving (Paete, Pakil)
        'woodworking',
        'wood carving',
        'wood sculpture',
        'papier-mâché',
        'paper crafts',
        'paper-mâché figures',
        'wooden bags',
        'metalwork',
        'woodwork',
        'handmade furniture',
        
        // Textiles & Embroidery (Lumban, Luisiana, Pila)
        'embroidery',
        'textiles',
        'weaving',
        'basketry',
        'basket weaving',
        'crochet',
        'knitting',
        'barong tagalog',
        'traditional garments',
        
        // Pottery & Ceramics (Pila, San Pedro, Victoria)
        'pottery',
        'ceramics',
        'clay pots',
        'ceramic art',
        
        // Jewelry & Accessories (Santa Cruz, Pagsanjan, Cavinti)
        'jewelry',
        'metalwork',
        'beaded accessories',
        'bracelets',
        'necklaces',
        'handmade accessories',
        
        // Footwear (Liliw, Biñan)
        'handmade slippers',
        'footwear',
        'traditional shoes',
        
        // Art & Statuary
        'statuary',
        'sculpture',
        'art',
        'paintings',
        'drawings',
        'charcoal art',
        
        // Other Laguna crafts
        'miniatures',
        'souvenirs',
        'rubber stamp',
        'traditional accessories',
        'handmade crafts',
        'handicrafts',
        'local crafts',
        
        // Paper & Fiber Arts
        'pineapple fiber',
        'abaca crafts',
        'native fiber crafts',
        'handwoven textiles',
        
        // Featured products
        'featured'
    ];

    /**
     * Offensive and inappropriate words filter
     */
    private static $profanityFilter = [
        // Common profanity
        'fuck', 'shit', 'damn', 'hell',
        'asshole', 'bitch', 'bastard',
        
        // Offensive terms
        'hate', 'kill', 'murder',
        'weapon', 'gun', 'knife',
        'drug', 'cocaine', 'marijuana',
        
        // Racial slurs
        'nigger', 'nigga', 'chink',
        
        // Adult content
        'sex', 'porn', 'xxx', 'nude',
        'erotic', 'explicit',
        
        // Scam/fraud terms
        'scam', 'fraud', 'fake',
        'counterfeit', 'replica',
        
        // Violence
        'violent', 'torture', 'abuse',
        'terrorism', 'bomb', 'explosive',
        
        // Copyright infringement
        'pirate', 'pirated', 'bootleg',
        'unauthorized', 'illegal',
        
        // Add more filters as needed
    ];

    /**
     * Towns and locations in Laguna
     */
    private static $lagunaTowns = [
        'paete', 'lumban', 'pila', 'pakil',
        'calauan', 'liliw', 'victoria',
        'pagsanjan', 'kalayaan', 'san pedro',
        'santa cruz', 'binan', 'calamba',
        'san pablo', 'bay', 'siniloan',
        'luisiana', 'cavinti', 'laguna'
    ];

    /**
     * Craft keywords that should be in product names
     */
    private static $craftKeywords = [
        'handmade', 'handcrafted', 'traditional',
        'artisan', 'craft', 'art', 'workshop',
        'custom', 'unique', 'local', 'laguna',
        'carved', 'embroidered', 'woven', 'pottery',
        'ceramic', 'wooden', 'textile', 'jewelry'
    ];

    /**
     * Main validation function
     */
    public static function validateProduct(array $productData): array
    {
        $validationResult = [
            'valid' => true,
            'errors' => [],
            'warnings' => [],
            'auto_approve' => false,
            'requires_review' => false,
            'rejection_reason' => null
        ];

        // Extract product information
        $productName = strtolower($productData['productName'] ?? '');
        $description = strtolower($productData['productDescription'] ?? '');
        $category = strtolower($productData['category'] ?? '');

        // 1. Check for offensive/inappropriate words
        $profanityCheck = self::checkProfanity($productName . ' ' . $description);
        if ($profanityCheck['found']) {
            $validationResult['valid'] = false;
            $validationResult['errors'][] = 'Product contains inappropriate language: ' . implode(', ', $profanityCheck['words']);
            $validationResult['rejection_reason'] = 'Contains inappropriate or offensive language';
            return $validationResult;
        }

        // 2. Validate category
        if (!self::isValidCategory($category)) {
            $validationResult['valid'] = false;
            $validationResult['errors'][] = 'Invalid category. Product must be a traditional Laguna craft item.';
            $validationResult['rejection_reason'] = 'Category does not match traditional Laguna crafts';
            return $validationResult;
        }

        // 3. Check product name quality
        $nameQuality = self::validateProductName($productName, $category);
        if (!$nameQuality['valid']) {
            $validationResult['valid'] = false;
            $validationResult['errors'] = array_merge($validationResult['errors'], $nameQuality['errors']);
            $validationResult['rejection_reason'] = $nameQuality['errors'][0];
            return $validationResult;
        }
        if (!empty($nameQuality['warnings'])) {
            $validationResult['warnings'] = array_merge($validationResult['warnings'], $nameQuality['warnings']);
        }

        // 4. Check description quality
        $descriptionQuality = self::validateDescription($description, $category);
        if (!$descriptionQuality['valid']) {
            $validationResult['warnings'] = array_merge($validationResult['warnings'], $descriptionQuality['errors']);
            $validationResult['requires_review'] = true;
        }

        // 5. Auto-approval criteria
        // Product can be auto-approved if it passes all checks and has high quality indicators
        if ($validationResult['valid'] && empty($validationResult['warnings'])) {
            $qualityScore = self::calculateQualityScore($productName, $description, $category);
            if ($qualityScore >= 0.8) {
                $validationResult['auto_approve'] = true;
            } else {
                $validationResult['requires_review'] = true;
            }
        }

        // Log validation results
        Log::info('Product validation completed', [
            'product_name' => $productName,
            'valid' => $validationResult['valid'],
            'auto_approve' => $validationResult['auto_approve'],
            'requires_review' => $validationResult['requires_review'],
            'errors' => count($validationResult['errors']),
            'warnings' => count($validationResult['warnings'])
        ]);

        return $validationResult;
    }

    /**
     * Check for profanity and offensive words
     */
    private static function checkProfanity(string $text): array
    {
        $foundWords = [];
        $lowerText = strtolower($text);

        foreach (self::$profanityFilter as $word) {
            if (strpos($lowerText, $word) !== false) {
                $foundWords[] = $word;
            }
        }

        return [
            'found' => !empty($foundWords),
            'words' => $foundWords
        ];
    }

    /**
     * Validate if category is valid for Laguna crafts
     */
    private static function isValidCategory(string $category): bool
    {
        // Check exact match
        if (in_array($category, self::$validLagunaCategories)) {
            return true;
        }

        // Check partial match (handles variations like "Wood Carving" vs "woodcarving")
        foreach (self::$validLagunaCategories as $validCategory) {
            if (strpos($category, $validCategory) !== false || strpos($validCategory, $category) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate product name quality
     */
    private static function validateProductName(string $name, string $category): array
    {
        $result = [
            'valid' => true,
            'errors' => [],
            'warnings' => []
        ];

        // Check minimum length
        if (strlen($name) < 5) {
            $result['valid'] = false;
            $result['errors'][] = 'Product name is too short. Please provide a more descriptive name.';
        }

        // Check maximum length
        if (strlen($name) > 100) {
            $result['warnings'][] = 'Product name is very long. Consider making it more concise.';
        }

        // Check if it contains craft keywords
        $hasCraftKeyword = false;
        foreach (self::$craftKeywords as $keyword) {
            if (strpos($name, $keyword) !== false) {
                $hasCraftKeyword = true;
                break;
            }
        }

        // Check if it's related to category
        $categoryRelated = false;
        foreach (self::$validLagunaCategories as $validCategory) {
            if (strpos($name, $validCategory) !== false || strpos($category, $validCategory) !== false) {
                $categoryRelated = true;
                break;
            }
        }

        // Warning if no craft keywords and not strongly category-related
        if (!$hasCraftKeyword && !$categoryRelated) {
            $result['warnings'][] = 'Product name should better describe the craft nature of the item.';
        }

        // Check for generic or vague names
        $genericNames = ['item', 'product', 'thing', 'object', 'stuff', 'goods', 'product1', 'test'];
        if (in_array($name, $genericNames)) {
            $result['valid'] = false;
            $result['errors'][] = 'Product name is too generic. Please provide a specific descriptive name.';
        }

        return $result;
    }

    /**
     * Validate product description quality
     */
    private static function validateDescription(string $description, string $category): array
    {
        $result = [
            'valid' => true,
            'errors' => []
        ];

        if (empty($description)) {
            $result['valid'] = false;
            $result['errors'][] = 'Product description is required';
            return $result;
        }

        // Check minimum length
        if (strlen($description) < 20) {
            $result['valid'] = false;
            $result['errors'][] = 'Product description is too short. Please provide more details.';
        }

        // Check if description is meaningful (not just repetitive)
        $wordCount = str_word_count($description);
        if ($wordCount < 10) {
            $result['valid'] = false;
            $result['errors'][] = 'Description needs more detail about the product.';
        }

        return $result;
    }

    /**
     * Calculate quality score for auto-approval decision
     */
    private static function calculateQualityScore(string $name, string $description, string $category): float
    {
        $score = 0.0;

        // Name quality (30%)
        $nameScore = 0;
        if (strlen($name) >= 10 && strlen($name) <= 80) $nameScore += 0.1;
        foreach (self::$craftKeywords as $keyword) {
            if (strpos($name, $keyword) !== false) {
                $nameScore += 0.1;
                break;
            }
        }
        $score += min($nameScore, 0.3);

        // Description quality (40%)
        $descScore = 0;
        $descLength = strlen($description);
        if ($descLength >= 50) $descScore += 0.15;
        if ($descLength >= 100) $descScore += 0.15;
        
        $wordCount = str_word_count($description);
        if ($wordCount >= 15) $descScore += 0.1;
        $score += min($descScore, 0.4);

        // Category relevance (20%)
        if (self::isValidCategory($category)) $score += 0.2;

        // Craft specificity (10%)
        foreach (self::$craftKeywords as $keyword) {
            if (strpos($name . ' ' . $description, $keyword) !== false) {
                $score += 0.05;
            }
        }

        return min($score, 1.0);
    }

    /**
     * Get suggestion for improving product listing
     */
    public static function getImprovementSuggestion(array $validationResult): array
    {
        $suggestions = [];

        if (!empty($validationResult['errors'])) {
            $suggestions[] = [
                'type' => 'error',
                'message' => 'Critical issues found. Please address these errors.',
                'details' => $validationResult['errors']
            ];
        }

        if (!empty($validationResult['warnings'])) {
            $suggestions[] = [
                'type' => 'warning',
                'message' => 'Improvements recommended for better product visibility.',
                'details' => $validationResult['warnings']
            ];
        }

        if (empty($suggestions)) {
            $suggestions[] = [
                'type' => 'success',
                'message' => 'Product meets all quality standards!'
            ];
        }

        return $suggestions;
    }
}

