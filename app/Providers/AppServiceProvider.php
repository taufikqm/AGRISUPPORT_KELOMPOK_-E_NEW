<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (env('APP_ENV') === 'production' || isset($_ENV['VERCEL'])) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Login::class, function ($event) {
            \App\Models\ActionLog::create([
                'user_id' => $event->user->id,
                'action_type' => 'auth_login',
                'detail' => 'User berhasil login dari IP: ' . request()->ip(),
                'performed_at' => now(),
            ]);
        });

        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Logout::class, function ($event) {
            if ($event->user) {
                \App\Models\ActionLog::create([
                    'user_id' => $event->user->id,
                    'action_type' => 'auth_logout',
                    'detail' => 'User melakukan logout dari IP: ' . request()->ip(),
                    'performed_at' => now(),
                ]);
            }
        });
    }
}
