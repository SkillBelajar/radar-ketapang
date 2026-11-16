<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin Operator
        User::updateOrCreate(
            ['email' => 'admin@radar.com'],
            [
                'name' => 'Commander Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Tim Sukses & Intel Analyst
        User::updateOrCreate(
            ['email' => 'timses@radar.com'],
            [
                'name' => 'Timses Lapangan & Analis',
                'password' => Hash::make('password'),
                'role' => 'timses',
                'email_verified_at' => now(),
            ]
        );

        // 3. Influencer & Buzz Ops
        User::updateOrCreate(
            ['email' => 'influencer@radar.com'],
            [
                'name' => 'Influencer Studio Operator',
                'password' => Hash::make('password'),
                'role' => 'influencer',
                'email_verified_at' => now(),
            ]
        );
    }
}
