<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
            <h1>Edit Product</h1>
            <div>
                @if ($errors->any())
    <div>
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif</div>
            <form action="{{ route('product.update', ['product' => $product]) }}" method="post" enctype="multipart/form-data">
                @csrf
                @method('put')
                <div>
                    <label for="productName">Product Name</label>
                    <input type="text" id="productName" name="productName" value="{{ ($product->productName) }}">

                    <label for="productDescription">Product Description</label>
                     <input type="text" id="productDescription" name="productDescription"  value="{{ ($product->productDescription) }}">

                    <label for="productPrice">Product Price</label>
                    <input type="number" id="productPrice" name="productPrice"  value="{{ ($product->productPrice) }}">

                    <label for="productImage">Product Image</label>
                        <input type="file" name="productImage" accept="image/*" value="{{ ($product->productImage) }}">
                    <label for="productVideo">Product Video</label>
                        <input type="file" name="productVideo" accept="video/*" value="{{ ($product->productVideo) }}">
                </div>
                <div>
                    <input type="Submit" value="Update Product" />
                </div>
            </form>
</body>
</html>