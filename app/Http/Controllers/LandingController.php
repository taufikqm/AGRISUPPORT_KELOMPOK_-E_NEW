<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function kebijakanPrivasi()
    {
        return Inertia::render('KebijanPrivasi');
    }

    public function syaratKetentuan()
    {
        return Inertia::render('SyaratKetentuan');
    }

    public function kontak()
    {
        return Inertia::render('Kontak');
    }
}
