<?php

namespace App\Notifications;

use App\Models\NewsFeed;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCrisisAlert extends Notification
{
    use Queueable;

    public NewsFeed $newsFeed;

    /**
     * Create a new notification instance.
     */
    public function __construct(NewsFeed $newsFeed)
    {
        $this->newsFeed = $newsFeed;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $score = (int) ($this->newsFeed->velocity_score ?? 0);
        $sentimentLabel = ucfirst((string) ($this->newsFeed->sentiment ?? 'neutral'));
        $aiStatus = $this->newsFeed->ai_status ?? 'success';

        if ($aiStatus === 'integrity_alert') {
            $level = 'integrity';
            $title = '🚨 Peringatan Integritas';
            $message = "Isu berpotensi pelanggaran hukum/etika terdeteksi (Skor {$score}). Segera lakukan tinjauan legal/klarifikasi formal.";
        } elseif ($score >= 75) {
            $level = 'danger';
            $title = '🚨 Isu Merah Terdeteksi!';
            $message = "Isu Merah Terdeteksi! Sentimen {$sentimentLabel} mencapai skor {$score}. Segera cek skrip reframing.";
        } elseif ($score >= 40) {
            $level = 'warning';
            $title = '⚠️ Isu Kuning (Waspada) Terdeteksi';
            $message = "Isu Kuning Waspada Terdeteksi! Sentimen {$sentimentLabel} mencapai skor {$score}. Persiapkan counter-narasi.";
        } else {
            $level = 'info';
            $title = 'ℹ️ Isu Teranalisis';
            $message = "Isu baru telah dianalisis AI dengan skor {$score}.";
        }

        return [
            'news_id' => $this->newsFeed->id,
            'news_title' => $this->newsFeed->title,
            'velocity_score' => $score,
            'sentiment' => $this->newsFeed->sentiment,
            'ai_status' => $aiStatus,
            'level' => $level,
            'title' => $title,
            'message' => $message,
            'url' => route('dashboard'),
        ];
    }
}
