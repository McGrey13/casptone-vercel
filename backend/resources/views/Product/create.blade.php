<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
            <h1>Create Product</h1>
            <form action="{{ route('product.store') }}" method="post" enctype="multipart/form-data">
                @csrf
                @method('post')
                <div>
                    <label for="productName">Product Name</label>
                    <input type="text" id="productName" name="productName" >

                    <label for="productDescription">Product Description</label>
                     <input type="text" id="productDescription" name="productDescription" >

                    <label for="productPrice">Product Price</label>
                    <input type="number" id="productPrice" name="productPrice" >

                    <label for="productImage">Product Image</label>
                        <input type="file" name="productImage" accept="image/*">
                    <label for="productVideo">Product Video</label>
                        <input type="file" name="productVideo" accept="video/*">
                </div>
                <div>

                @if ($errors->any())
    <div>
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
                    <input type="submit" value="Save as new Product" />
                </div>
            </form>
</body>
</html>