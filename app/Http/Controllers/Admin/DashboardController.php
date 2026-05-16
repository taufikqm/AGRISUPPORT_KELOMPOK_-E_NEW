<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgriculturalArea;
use App\Models\FieldObservation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalPetani    = User::where('role', 'petani')->count();
        $totalLahan     = AgriculturalArea::count();
        $totalObservasi = FieldObservation::count();

        $observasiTerbaru = FieldObservation::with('agriculturalArea:id,name')
            ->latest('observation_date')
            ->limit(5)
            ->get(['id', 'agricultural_area_id', 'observation_date', 'crop_condition']);

        $petaniBaru = User::where('role', 'petani')
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'totalPetani'      => $totalPetani,
            'totalLahan'       => $totalLahan,
            'totalObservasi'   => $totalObservasi,
            'observasiTerbaru' => $observasiTerbaru,
            'petaniBaru'       => $petaniBaru,
        ]);
    }
}
