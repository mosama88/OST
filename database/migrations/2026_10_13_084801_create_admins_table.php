<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('mobile')->nullable()->unique();
            $table->string('username')->unique();
            $table->string('password');
            $table->enum('gender', [1, 2])->default(1); //(male | female)
            $table->enum('status', [1, 2])->default(1); //(active | suspended)
            $table->unsignedInteger('created_by')->default(0);
            $table->string('created_by_guard')->nullable();
            $table->unsignedInteger('updated_by')->default(0);
            $table->string('updated_by_guard')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};