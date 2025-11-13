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
        'price',
        'amount',
        'status',
        'sale_start_date',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'amount' => 'integer',
        'sale_start_date' => 'datetime',
    ];

    /**
     * Relationships - Uncomment when Event model is ready
     */
    // public function event()
    // {
    //     return $this->belongsTo(Event::class);
    // }

    /**
     * Accessors
     * Check if tickets are currently on sale (REQUIRED by assignment)
     */
    public function getIsOnSaleAttribute(): bool
    {
        return Carbon::now()->isAfter($this->sale_start_date);
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
        return $query->where('status', 'available')->where('sale_start_date', '<=', Carbon::now());
    }

    /**
     * Scope to get tickets for a specific event
     */
    public function scopeForEvent($query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

}
