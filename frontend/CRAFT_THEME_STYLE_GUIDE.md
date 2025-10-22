# CraftConnect Seller Interface - Craft Theme Style Guide

## 🎨 Color Palette

### Primary Colors
```jsx
// Main craft gradient
bg-gradient-to-r from-[#a4785a] to-[#7b5a3b]

// Hover states
hover:from-[#8f674a] hover:to-[#6a4c34]

// Text colors
text-[#5c3d28]  // Dark brown - headings, titles
text-[#7b5a3b]  // Medium brown - body text, descriptions

// Borders
border-[#e5ded7]  // Light border
border-[#d5bfae]  // Medium border

// Backgrounds
bg-[#faf9f8]  // Very light cream
bg-[#f8f1ec]  // Light cream for hover states
```

### Accent Colors
- Green: Revenue, success, completed
- Blue: Processing, information
- Purple: Special features
- Yellow: Pending, warnings
- Red: Errors, delete actions

## 📦 Component Patterns

### 1. Page Headers

```jsx
<div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
  <div className="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 className="text-3xl font-bold text-white flex items-center">
        <Icon className="h-8 w-8 mr-3" />
        Page Title
      </h1>
      <p className="text-white/90 mt-2 text-lg">
        Page description text
      </p>
    </div>
    <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 shadow-lg transition-all duration-200">
      <RefreshCw className="h-4 w-4 mr-2" /> Refresh
    </Button>
  </div>
</div>
```

### 2. Stat Cards

```jsx
<Card className="border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-semibold text-[#5c3d28]">Title</CardTitle>
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-lg">
      <Icon className="h-5 w-5 text-white" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] bg-clip-text text-transparent">
      {value}
    </div>
    <p className="text-xs text-[#7b5a3b] mt-1">{description}</p>
  </CardContent>
</Card>
```

### 3. Standard Cards

```jsx
<Card className="border-[#e5ded7] shadow-xl">
  <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
    <CardTitle className="text-[#5c3d28] flex items-center">
      <Icon className="h-5 w-5 mr-2 text-[#a4785a]" />
      Card Title
    </CardTitle>
    <CardDescription className="text-[#7b5a3b]">Description text</CardDescription>
  </CardHeader>
  <CardContent className="pt-6">
    {/* Content */}
  </CardContent>
</Card>
```

### 4. Buttons

**Primary Button**:
```jsx
<Button className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200">
  <Icon className="mr-2 h-4 w-4" /> Button Text
</Button>
```

**Outline Button**:
```jsx
<Button 
  variant="outline"
  className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
>
  <Icon className="mr-2 h-4 w-4" /> Button Text
</Button>
```

**Ghost Button**:
```jsx
<Button 
  variant="ghost"
  className="text-[#a4785a] hover:bg-[#f8f1ec] hover:text-[#5c3d28] transition-all duration-200"
>
  Action
</Button>
```

### 5. Search Input

```jsx
<div className="relative flex-1 max-w-md">
  <Search className="absolute left-3 top-3 h-5 w-5 text-[#a4785a]" />
  <Input
    placeholder="Search..."
    className="pl-10 pr-4 py-2.5 border-2 border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all"
  />
</div>
```

### 6. Tabs

```jsx
<TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-[#faf9f8] border-2 border-[#e5ded7] p-1 rounded-xl shadow-md">
  <TabsTrigger 
    value="tab1"
    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
  >
    Tab 1
  </TabsTrigger>
</TabsList>
```

### 7. Interactive Item Cards

```jsx
<div className="p-4 border-2 border-[#e5ded7] rounded-xl hover:border-[#a4785a] hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-[#faf9f8]">
  {/* Content */}
</div>
```

### 8. Icon Badges

**Gradient Badge**:
```jsx
<div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-lg">
  <Icon className="h-6 w-6 text-white" />
</div>
```

**Colored Badge (Green, Blue, Purple, etc.)**:
```jsx
<div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
  <Icon className="h-6 w-6 text-white" />
</div>
```

### 9. Status Badges

```jsx
// Success
<Badge className="bg-green-100 text-green-800 border-green-200">Status</Badge>

// Warning  
<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Status</Badge>

// Info
<Badge className="bg-blue-100 text-blue-800 border-blue-200">Status</Badge>

// Error
<Badge className="bg-red-100 text-red-800 border-red-200">Status</Badge>

// Craft theme
<Badge className="bg-[#a4785a]/10 text-[#5c3d28] border-[#d5bfae]">Status</Badge>
```

### 10. Progress Bars

```jsx
<div className="w-full bg-[#e5ded7] rounded-full h-2.5">
  <div 
    className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] h-2.5 rounded-full transition-all duration-300"
    style={{ width: `${percentage}%` }}
  ></div>
</div>
```

## 🎯 Animation Patterns

### Hover Animations

**Card Lift**:
```jsx
className="hover:-translate-y-1 transition-all duration-300"
```

**Shadow Enhancement**:
```jsx
className="shadow-lg hover:shadow-xl transition-shadow duration-300"
```

**Scale on Hover**:
```jsx
className="hover:scale-110 transition-transform duration-200"
```

**Border Color Change**:
```jsx
className="border-[#e5ded7] hover:border-[#a4785a] transition-colors duration-200"
```

## 📋 Component Checklist

### Every Component Should Have:
- [ ] Gradient header with icon and title
- [ ] Craft-themed colors throughout
- [ ] Hover effects on interactive elements
- [ ] Consistent button styling
- [ ] Proper card shadows
- [ ] Smooth transitions (200-300ms)
- [ ] Gradient icon badges where appropriate
- [ ] Craft-themed borders

### Example: Complete Component Template

```jsx
const MyComponent = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Icon className="h-8 w-8 mr-3" />
          Component Title
        </h1>
        <p className="text-white/90 mt-2 text-lg">Description</p>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card Pattern */}
        <Card className="border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Card Content */}
        </Card>
      </div>

      {/* Detail Card */}
      <Card className="border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] flex items-center">
            <Icon className="h-5 w-5 mr-2 text-[#a4785a]" />
            Section Title
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Content */}
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🎨 Quick Reference

### When Styling a Component:

1. **Header**: Always use gradient background
2. **Cards**: Border `[#e5ded7]`, gradient background
3. **Buttons**: Gradient for primary, outlined for secondary
4. **Icons**: Circular gradient badges
5. **Text**: Dark brown for headings, medium for body
6. **Hover**: Always add transitions
7. **Shadows**: `shadow-lg` to `shadow-xl` on hover

### Color Usage by Element

| Element | Color | Example |
|---------|-------|---------|
| Page Headers | White text on gradient | `text-white` on `from-[#a4785a] to-[#7b5a3b]` |
| Card Titles | Dark brown | `text-[#5c3d28]` |
| Descriptions | Medium brown | `text-[#7b5a3b]` |
| Borders | Light tan | `border-[#e5ded7]` |
| Input Borders | Medium tan | `border-[#d5bfae]` |
| Backgrounds | Cream/tan | `bg-[#faf9f8]` |
| Hover Backgrounds | Light cream | `hover:bg-[#f8f1ec]` |

## ✅ Components Updated

1. ✅ SellerDashboard.jsx
2. ✅ SellerLayout.jsx  
3. ✅ OrderInventoryManager.jsx
4. ✅ SellerAnalytics.jsx

## 📝 Remaining Components

Apply the same patterns to:
- [ ] MarketingTools.jsx
- [ ] WorkshopsEvents.jsx
- [ ] SellerSettings.jsx
- [ ] ProfilePage.jsx
- [ ] PaymentSettings.jsx
- [ ] StorefrontCustomizer.jsx
- [ ] AddProductModal.jsx
- [ ] EditProductModal.jsx
- [ ] EditableSellerDetail.jsx
- [ ] FeaturedProducts.jsx
- [ ] SocialMedia.jsx
- [ ] ShippingSettings.jsx

## 🚀 Implementation Tips

1. **Start with the header** - Most visible element
2. **Update buttons** - High impact, easy to do
3. **Style cards** - Consistent look
4. **Add hover effects** - Interactive feel
5. **Update inputs** - Better UX

## 📚 Resources

- All color values come from `Login.jsx`
- Icon library: `lucide-react`
- UI components: shadcn/ui
- Transitions: Tailwind CSS

This design language creates a warm, professional, craftsman aesthetic perfect for an artisan marketplace! 🎨

