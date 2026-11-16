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
        Schema::table('news_feeds', function (Blueprint $table) {
            $table->integer('velocity_score')->default(0)->after('status');
            $table->enum('sentiment', ['positive', 'neutral', 'negative'])->default('neutral')->after('velocity_score');
            $table->json('fact_anchor')->nullable()->after('sentiment');
            $table->json('scripts')->nullable()->after('fact_anchor');
            $table->string('ai_status')->default('pending')->after('scripts'); // pending, success, integrity_alert
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news_feeds', function (Blueprint $table) {
            $table->dropColumn([
                'velocity_score',
                'sentiment',
                'fact_anchor',
                'scripts',
                'ai_status',
            ]);
        });
    }
};
