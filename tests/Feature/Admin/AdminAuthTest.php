<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_with_valid_credentials(): void
    {
        $admin = User::factory()->state(['role' => 'admin'])->create();

        $response = $this->post(route('admin.login.post'), [
            'email'    => $admin->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin);
    }

    public function test_admin_login_fails_with_wrong_password(): void
    {
        $admin = User::factory()->state(['role' => 'admin'])->create();

        $response = $this->post(route('admin.login.post'), [
            'email'    => $admin->email,
            'password' => 'salah-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_login_fails_with_unknown_email(): void
    {
        $response = $this->post(route('admin.login.post'), [
            'email'    => 'tidakada@email.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_farmer_is_redirected_from_admin_routes(): void
    {
        $farmer = User::factory()->state(['role' => 'petani'])->create();

        $response = $this->actingAs($farmer)->get('/admin/dashboard');

        $response->assertRedirect(route('dashboard'));
    }

    public function test_guest_is_redirected_to_admin_login(): void
    {
        $response = $this->get('/admin/dashboard');

        $response->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_logout(): void
    {
        $admin = User::factory()->state(['role' => 'admin'])->create();

        $response = $this->actingAs($admin)->post(route('admin.logout'));

        $response->assertRedirect(route('admin.login'));
        $this->assertGuest();
    }

    public function test_users_table_has_role_column_with_default_petani(): void
    {
        $farmer = User::factory()->create();

        $this->assertDatabaseHas('users', [
            'id'   => $farmer->id,
            'role' => 'petani',
        ]);
    }

    public function test_admin_seeder_creates_admin_user(): void
    {
        $this->seed(\Database\Seeders\AdminSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@agrisupport.id',
            'role'  => 'admin',
        ]);
    }
}
