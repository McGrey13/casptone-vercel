 <?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_products', function (Blueprint $table) {
            $table->id('orderProducts_id');
            $table->foreignId('order_id')->constrained('orders', 'orderID')->onDelete('cascade'); // Foreign key to orders table
            $table->foreignId('product_id')->constrained('products', 'product_id')->onDelete('cascade'); // Foreign key to products table (assuming you'll have one)
            $table->integer('quantity');
            $table->decimal('price', 8, 2); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_products');
    }
}; 
