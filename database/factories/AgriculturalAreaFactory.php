<?php

namespace Database\Factories;

use App\Models\AgriculturalArea;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

/**
 * @extends Factory<AgriculturalArea>
 */
class AgriculturalAreaFactory extends Factory
{
    protected $model = AgriculturalArea::class;

    public function definition(): array
    {
        // Koordinat sekitar Yogyakarta (SRID 4326)
        $lng = fake()->randomFloat(6, 110.0, 110.5);
        $lat = fake()->randomFloat(6, -8.0, -7.5);
        $offset = 0.005;

        $wkt = sprintf(
            'POLYGON((%s %s, %s %s, %s %s, %s %s, %s %s))',
            $lng, $lat,
            $lng + $offset, $lat,
            $lng + $offset, $lat + $offset,
            $lng, $lat + $offset,
            $lng, $lat
        );

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true) . ' Farm',
            'area_size' => fake()->randomFloat(2, 0.5, 10.0),
            'soil_type' => fake()->randomElement(['liat', 'pasir', 'lempung', 'gambut']),
            'notes' => fake()->optional()->sentence(),
            'geometry' => DB::raw("ST_GeomFromText('{$wkt}', 4326)"),
        ];
    }
}
