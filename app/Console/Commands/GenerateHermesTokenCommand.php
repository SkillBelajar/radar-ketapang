<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class GenerateHermesTokenCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hermes:generate-token 
                            {--email=admin@radar.com : Email pengguna pemilik token}
                            {--name=hermes-agent-token : Nama token personal access Sanctum}
                            {--plain : Hanya cetak string token mentah}
                            {--save-env : Simpan token ke file .env sebagai HERMES_API_TOKEN}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Personal Access Token Laravel Sanctum untuk otentikasi Hermes Agent Gateway';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->option('email');
        $tokenName = $this->option('name');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $user = User::where('role', 'admin')->first() ?? User::first();
        }

        if (! $user) {
            $this->error("Pengguna dengan email [{$email}] atau role [admin] tidak ditemukan.");
            return self::FAILURE;
        }

        // Hapus token lama dengan nama yang sama agar token statis tetap bersih
        $user->tokens()->where('name', $tokenName)->delete();

        // Buat token baru dengan hak akses penuh
        $newAccessToken = $user->createToken($tokenName, ['*']);
        $plainTextToken = $newAccessToken->plainTextToken;

        if ($this->option('plain')) {
            $this->line($plainTextToken);
            return self::SUCCESS;
        }

        $this->info("==========================================================");
        $this->info("  RADAR POLITIK // HERMES GATEWAY AUTHENTICATION TOKEN    ");
        $this->info("==========================================================");
        $this->line("<comment>User Entitas :</comment> {$user->name} ({$user->email}) [Role: {$user->role}]");
        $this->line("<comment>Token Name   :</comment> {$tokenName}");
        $this->line("<comment>Sanctum ID   :</comment> #{$newAccessToken->accessToken->id}");
        $this->newLine();
        $this->line("<question> HERMES ACCESS TOKEN (BEARER) : </question>");
        $this->newLine();
        $this->line("<fg=cyan;options=bold>{$plainTextToken}</>");
        $this->newLine();
        $this->line("<comment>Contoh Penggunaan Header HTTP:</comment>");
        $this->line("  Authorization: Bearer {$plainTextToken}");
        $this->newLine();
        $this->line("<comment>Contoh CURL Fetch News:</comment>");
        $this->line("  curl -X GET http://localhost:8282/api/v1/hermes/fetch-news \\");
        $this->line("       -H 'Authorization: Bearer {$plainTextToken}' \\");
        $this->line("       -H 'Accept: application/json'");
        $this->newLine();

        if ($this->option('save-env')) {
            $this->saveTokenToEnv($plainTextToken);
        }

        return self::SUCCESS;
    }

    /**
     * Simpan atau perbarui nilai HERMES_API_TOKEN di file .env
     */
    protected function saveTokenToEnv(string $token): void
    {
        $envPath = base_path('.env');
        if (! file_exists($envPath)) {
            return;
        }

        $envContent = file_get_contents($envPath);
        if (str_contains($envContent, 'HERMES_API_TOKEN=')) {
            $envContent = preg_replace('/^HERMES_API_TOKEN=.*$/m', "HERMES_API_TOKEN={$token}", $envContent);
        } else {
            $envContent .= "\nHERMES_API_TOKEN={$token}\n";
        }

        file_put_contents($envPath, $envContent);
        $this->info("[OK] Token berhasil disimpan ke file .env sebagai HERMES_API_TOKEN.");
    }
}
