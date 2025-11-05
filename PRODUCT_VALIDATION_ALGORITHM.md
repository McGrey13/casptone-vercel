# Product Validation Algorithm Documentation

## Overview

The Product Validation Algorithm is an intelligent system designed to automatically validate and approve/reject products submitted by Laguna artisans on the CraftConnect platform. It ensures that only authentic, traditional Laguna crafts are accepted, while filtering out inappropriate content and low-quality listings.

## Features

### 1. **Laguna Craft Category Validation**
- Validates product categories against authentic Laguna traditional crafts
- Accepted categories include:
  - **Woodworking & Carving** (Paete, Pakil): Wood carving, papier-mâché, wooden bags, metalwork
  - **Textiles & Embroidery** (Lumban, Luisiana, Pila): Embroidery, weaving, barong Tagalog
  - **Pottery & Ceramics** (Pila, San Pedro, Victoria): Pottery, ceramic art
  - **Jewelry & Accessories** (Santa Cruz, Pagsanjan, Cavinti): Jewelry, beaded accessories
  - **Footwear** (Liliw, Biñan): Handmade slippers, traditional shoes
  - **Art & Statuary**: Sculptures, paintings, drawings
  - And other traditional Laguna crafts

### 2. **Profanity & Offensive Language Filter**
- Automatically filters inappropriate words and phrases
- Detects common profanity, offensive terms, racial slurs
- Blocks adult content, violent language, and scam-related terms
- Prevents copyright infringement terms

### 3. **Quality Assessment**
- **Product Name Quality**: Checks for descriptive, craft-specific names
- **Description Quality**: Ensures meaningful product descriptions (minimum length, word count)
- **Category Relevance**: Validates that category matches product details
- **Auto-Approval Scoring**: High-quality products are auto-approved

### 4. **Three-Tier Approval System**

#### **Auto-Approved**
- Products that meet all quality standards
- Quality score ≥ 0.8
- No validation errors or warnings
- Listed immediately on platform

#### **Pending Review**
- Products with minor quality issues
- Quality score between 0.5-0.8
- Requires administrator review
- Notifies admin for manual inspection

#### **Auto-Rejected**
- Products with validation errors
- Invalid category for Laguna crafts
- Contains inappropriate language
- Description too vague or generic

## Algorithm Flow

```
1. Product Submission
   ↓
2. Profanity Check
   ├─ Offensive language found? → REJECT
   └─ Clean → Continue
   ↓
3. Category Validation
   ├─ Valid Laguna craft? → Continue
   └─ Invalid → REJECT
   ↓
4. Product Name Quality Check
   ├─ Valid length? → Continue
   └─ Too short/generic → REJECT
   ↓
5. Description Quality Check
   ├─ Sufficient detail? → Continue
   └─ Too brief → WARNING (Pending Review)
   ↓
6. Quality Score Calculation
   ├─ Score ≥ 0.8 → AUTO-APPROVE
   ├─ Score 0.5-0.8 → PENDING REVIEW
   └─ Score < 0.5 → AUTO-REJECT
   ↓
7. Response
   ├─ Approved → Product listed
   ├─ Pending → Admin notified
   └─ Rejected → Seller notified with reason
```

## Quality Score Components

| Component | Weight | Criteria |
|-----------|--------|----------|
| Name Quality | 30% | Length (10-80 chars), craft keywords |
| Description Quality | 40% | Length (≥50 chars), word count (≥15 words) |
| Category Relevance | 20% | Valid Laguna craft category |
| Craft Specificity | 10% | Presence of craft-related keywords |

**Total Score**: Sum of all components (max 1.0)

## Example Validations

### ✅ Auto-Approved Example
```json
{
  "productName": "Handmade Wooden Carved Statue of San Pedro from Paete",
  "category": "wood carving",
  "productDescription": "Beautiful handcrafted wooden statue of San Pedro, 
  traditional art from Paete, Laguna. Made from premium wood and finished 
  with natural oils. Perfect for home or church decoration."
}
```
**Quality Score**: 0.95 → Auto-approved

### ⚠️ Pending Review Example
```json
{
  "productName": "Wooden Toy",
  "category": "woodwork",
  "productDescription": "Nice wooden toy for kids."
}
```
**Quality Score**: 0.55 → Pending admin review

### ❌ Rejected Example
```json
{
  "productName": "Test Product",
  "category": "electronics",
  "productDescription": "This is a test."
}
```
**Reason**: Invalid category for Laguna crafts

## Implementation Details

### Files Created/Modified

1. **ProductValidationService.php** (`backend/app/Services/`)
   - Core validation logic
   - Category validation
   - Profanity filtering
   - Quality scoring

2. **ProductController.php** (`backend/app/Http/Controllers/`)
   - Integrated validation on product creation
   - Updated approval/rejection methods
   - Enhanced error handling

3. **Product.php** (`backend/app/Models/`)
   - Added `rejection_reason` field

4. **Migration** (`backend/database/migrations/`)
   - Added `rejection_reason` column to products table

### API Response Examples

#### Success (Auto-Approved)
```json
{
  "message": "Product approved and created successfully!",
  "product": {
    "id": 123,
    "productName": "Handmade Wooden Carved Statue",
    "approval_status": "approved",
    ...
  }
}
```

#### Pending Review
```json
{
  "message": "Product submitted for review. It will be approved by an administrator shortly.",
  "product": {
    "id": 124,
    "approval_status": "pending",
    ...
  },
  "validation_warnings": [
    "Product name should better describe the craft nature of the item."
  ]
}
```

#### Rejected
```json
{
  "message": "Product validation failed",
  "errors": [
    "Invalid category. Product must be a traditional Laguna craft item."
  ],
  "rejection_reason": "Category does not match traditional Laguna crafts",
  "suggestions": [
    {
      "type": "error",
      "message": "Critical issues found. Please address these errors.",
      "details": ["Invalid category. Product must be a traditional Laguna craft item."]
    }
  ]
}
```

## Admin Actions

### Approve Product
```http
PUT /api/products/{id}/approve
Authorization: Bearer {admin_token}

Response:
{
  "message": "Product approved successfully"
}
```

### Reject Product
```http
PUT /api/products/{id}/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Product does not meet quality standards"
}

Response:
{
  "message": "Product rejected successfully",
  "rejection_reason": "Product does not meet quality standards"
}
```

## Benefits

1. **Quality Assurance**: Ensures only authentic Laguna crafts are listed
2. **Brand Protection**: Maintains platform integrity and trust
3. **Automated Efficiency**: Reduces admin workload with smart auto-approval
4. **Seller Guidance**: Provides clear feedback on rejected products
5. **Community Standards**: Filters inappropriate content automatically
6. **Cultural Preservation**: Protects traditional craft authenticity

## Future Enhancements

1. **Image Analysis**: AI-powered image verification to detect non-handmade items
2. **Machine Learning**: Learn from admin decisions to improve accuracy
3. **Seller Reputation**: Auto-approve trusted sellers more quickly
4. **Multi-language Support**: Validate Filipino/Tagalog descriptions
5. **Category Expansion**: Dynamic category updates based on new crafts

## Alignment with Study Objectives

This system directly supports the following objectives:

- **Objective 1**: Develop a centralized online marketplace where Laguna artisans can list, manage, and sell their products
- **Objective 2**: Improve artisan visibility by adding marketing tools and personalized recommendations
- **Objective 4**: Support local economic growth by providing digital tools and promoting online market competitiveness

The validation algorithm ensures that CraftConnect remains a platform exclusively for authentic Laguna crafts, supporting the study's focus on traditional artisanal heritage.

