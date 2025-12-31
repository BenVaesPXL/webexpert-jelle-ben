<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Ticket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'event_id',
        'type',
        'description',
        'price',
        'quantity',
        'available_quantity',
        'sale_starts_at',
        'sale_ends_at',
        'status',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'available_quantity' => 'integer',
        'sale_starts_at' => 'datetime',
        'sale_ends_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Accessors
     * Check if tickets are currently on sale (REQUIRED by assignment)
     */
    public function getIsOnSaleAttribute(): bool
    {
        $now = Carbon::now();
        $saleStarted = !$this->sale_starts_at || $now->isAfter($this->sale_starts_at);
        $saleNotEnded = !$this->sale_ends_at || $now->isBefore($this->sale_ends_at);
        
        return $saleStarted && $saleNotEnded;
    }

    /**
     * Check if tickets are available
     */
    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'available' && $this->is_on_sale;
    }

    /**
     * Scope to get only available tickets
     */
    public function scopeAvailable($query)
    {
        $now = Carbon::now();
        return $query->where('status', 'available')
            ->where(function($q) use ($now) {
                $q->whereNull('sale_starts_at')
                  ->orWhere('sale_starts_at', '<=', $now);
            })
            ->where(function($q) use ($now) {
                $q->whereNull('sale_ends_at')
                  ->orWhere('sale_ends_at', '>=', $now);
            });
    }

    /**
     * Scope to get tickets for a specific event
     */
    public function scopeForEvent($query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

}
