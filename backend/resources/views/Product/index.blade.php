<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
        <h1>Product</h1>
        <div>
            @if (session()->has('success')) 
                    <div>
                        {{ session('success') }}
                    </div>
            @endif
        </div>
        <div>
            <table border="1">
                <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Poduct Description</th>
                    <th>Product Price</th>
                    <th>Product Image</th>
                    <th>Product Video</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                @foreach ($product as $product )
                <tr>
                    <td>{{ $product->id }}</td>
                    <td>{{ $product->productName }}</td>
                    <td>{{ $product->productDescription }}</td>
                    <td>{{ $product->productPrice }}</td>
                    <td>{{ $product->productImage }}</td>
                    <td>{{ $product->productVideo }}</td>
                    <td>
                        <a href="{{ route('product.edit',['product' => $product]) }}">Edit</a>
                    </td>
                    <td>
                        <form method="post" action="{{ route('product.destroy', ['product' => $product]) }}">
                            @csrf
                            @method('delete')
                            <input type="Submit" value="Delete" />
                        </form>
                    </td>
                </tr>
                @endforeach
            </table>
            
                @if ($errors->any())
    <div>
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
        </div>
</body>
</html>