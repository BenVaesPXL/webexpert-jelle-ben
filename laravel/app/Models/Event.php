<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Ticket;
use App\Models\User;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
        'start_date',
        'end_date',
        'tickets_available_from',
        'owner_id',
        'is_published',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'tickets_available_from' => 'datetime',
    ];

    /**
     * Admin / owner van het event
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Alle tickets van dit event
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Enkel tickets die effectief te koop zijn
     */
    public function availableTickets()
    {
        return $this->hasMany(Ticket::class)
            ->where('available_quantity', '>', 0)
            ->where(function ($q) {
                $q->whereNull('sale_starts_at')
                  ->orWhere('sale_starts_at', '<=', now());
            });
    }
}
