<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureIsAdmin::class,
        ]);

        $middleware->redirectGuestsTo(fn () => route('login'));
        $middleware->redirectUsersTo(function (Request $request) {
            return $request->user()?->role === 'admin'
                ? route('admin.dashboard')
                : route('wilayah-lahan.index');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();


// Vercel Serverless Hack: Redirect all storage writes to the writable /tmp directory
if (isset($_ENV['VERCEL']) || env('VERCEL', false)) {
    $vercelStorage = '/tmp/storage';
    if (!is_dir($vercelStorage)) {
        mkdir($vercelStorage . '/framework/views', 0777, true);
        mkdir($vercelStorage . '/framework/cache/data', 0777, true);
        mkdir($vercelStorage . '/logs', 0777, true);
    }
    $app->useStoragePath($vercelStorage);
}

return $app;
