<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Store::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seller_id' => Seller::factory(),
            'user_id' => User::factory(),
            'store_name' => $this->faker->company . ' Store',
            'store_description' => $this->faker->paragraph,
            'category' => $this->faker->randomElement([
                'Native Handicraft',
                'Miniatures & Souvenirs',
                'Rubber Stamp Engraving',
                'Traditional Accessories',
                'Statuary & Sculpture',
                'Basketry & Weaving'
            ]),
            'logo_path' => null,
            'bir_path' => null,
            'dti_path' => null,
            'id_image_path' => null,
            'id_type' => $this->faker->randomElement([
                'UMID', 'SSS', 'GSIS', 'LTO', 'Postal', 'Passport', 
                'PhilHealth', 'PhilID', 'PRC', 'Alien', 'Foreign_Passport'
            ]),
            'tin_number' => $this->faker->numerify('###-###-###-###'),
            'owner_name' => $this->faker->name,
            'owner_email' => $this->faker->email,
            'owner_phone' => $this->faker->phoneNumber,
            'owner_address' => $this->faker->address,
            'status' => 'pending',
            'rejection_reason' => null,
        ];
    }

    /**
     * Indicate that the store is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    /**
     * Indicate that the store is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejection_reason' => $this->faker->sentence,
        ]);
    }
}