<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('website.index');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::get('/dashboard/index', function () {
    return view('dashboard.index');
})->middleware(['auth', 'verified'])->name('dashboard.home');



Route::get('/dashboard/news', function () {
    return view('dashboard.news');
})->middleware(['auth', 'verified'])->name('dashboard.news');



require __DIR__ . '/auth.php';