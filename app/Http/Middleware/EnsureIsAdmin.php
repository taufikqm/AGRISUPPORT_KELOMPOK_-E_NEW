<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()->role !== 'admin') {
            return redirect()->route('dashboard')
                ->with('error', 'Akses tidak diizinkan. Halaman ini khusus admin.');
        }

        return $next($request);
    }
}
