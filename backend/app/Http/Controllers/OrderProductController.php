<?php

namespace App\Http\Controllers;

use App\Models\OrderProduct;
use Illuminate\Http\Request;

class OrderProductController extends Controller
{
    public function index()
    {
        return response()->json(OrderProduct::with(['order', 'product'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'in:pending,packing,shipped,delivered',
        ]);

        $orderProduct = OrderProduct::create($validated);

        return response()->json($orderProduct, 201);
    }

    public function show($id)
    {
        $orderProduct = OrderProduct::with(['order', 'product'])->findOrFail($id);
        return response()->json($orderProduct);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'order_id' => 'exists:orders,id',
            'product_id' => 'exists:products,id',
            'total_amount' => 'numeric|min:0',
            'status' => 'in:pending,packing,shipped,delivered',
        ]);

        $orderProduct = OrderProduct::findOrFail($id);
        $orderProduct->update($validated);

        return response()->json($orderProduct);
    }

    public function destroy($id)
    {
        $orderProduct = OrderProduct::findOrFail($id);
        $orderProduct->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
