<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        User::create([
            'name' => 'Mohamed Osama',
            'email' => 'mosama88@hotmail.com',
            'password' => Hash::make('@Osama88'),
        ]);


        Admin::factory()->create([
            'name' => 'Mohamed Osama',
            'username' => 'mosama',
        ]);
    }
}