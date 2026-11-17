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
        Schema::table('target_setups', function (Blueprint $table) {
            $table->string('candidate_name')->nullable()->after('id');
            $table->string('political_role')->nullable()->after('candidate_name');
            $table->string('electoral_district')->nullable()->after('political_role');
            $table->string('branding_tagline')->nullable()->after('electoral_district');
            $table->json('branding_pillars')->nullable()->after('branding_tagline');
            $table->text('branding_goal')->nullable()->after('branding_pillars');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('target_setups', function (Blueprint $table) {
            $table->dropColumn([
                'candidate_name',
                'political_role',
                'electoral_district',
                'branding_tagline',
                'branding_pillars',
                'branding_goal',
            ]);
        });
    }
};
