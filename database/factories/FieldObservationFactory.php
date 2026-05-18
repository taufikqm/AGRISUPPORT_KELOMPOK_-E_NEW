<?php

namespace Database\Factories;

use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FieldObservation>
 */
class FieldObservationFactory extends Factory
{
    protected $model = FieldObservation::class;

    public function definition(): array
    {
        return [
            'user_id'               => User::factory(),
            'agricultural_area_id'  => AgriculturalArea::factory(),
            'planting_cycle' => fake()->randomElement(['MT1', 'MT2', 'MT3', null]),
            'observation_date' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'soil_moisture' => fake()->randomElement(['Kering', 'Normal', 'Lembab', 'Sangat Basah']),
            'water_puddle' => fake()->randomElement(['Tidak Ada', 'Sedikit', 'Sedang', 'Banyak']),
            'crop_condition' => fake()->randomElement(['Kritis', 'Kurang Baik', 'Baik', 'Sangat Baik']),
            'pest_indication' => fake()->randomElement(['Tidak Ada', 'Ringan', 'Sedang', 'Berat']),
            'disease_indication' => fake()->randomElement(['Tidak Ada', 'Ringan', 'Sedang', 'Berat']),
            'notes' => fake()->optional()->sentence(),
            'weather_temp' => fake()->randomFloat(2, 22.0, 36.0),
            'weather_condition' => fake()->randomElement(['0', '1', '2', '3', '51', '61', '80']),
            'weather_humidity' => fake()->randomFloat(2, 50.0, 95.0),
            'weather_wind_kph' => fake()->randomFloat(2, 0.0, 30.0),
            'weather_precip_mm' => fake()->randomFloat(2, 0.0, 50.0),
            'weather_soil_moisture' => fake()->randomFloat(3, 0.1, 0.9),
            'recommendations_viewed_at' => null,
        ];
    }

    // Gunakan saat area dan user sudah dibuat di luar factory
    public function forArea(AgriculturalArea $area): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $area->user_id,
            'agricultural_area_id' => $area->id,
        ]);
    }
}
