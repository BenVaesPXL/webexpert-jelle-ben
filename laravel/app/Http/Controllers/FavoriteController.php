<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class FavoriteController extends Controller
{
    /**
     * Get all favorite events for the authenticated user
     */
    public function index(Request $request)
    {
        $favorites = $request->user()
            ->favorites()
            ->with('tickets')
            ->orderBy('favorites.created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }

    /**
     * Add an event to favorites
     */
    public function store(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);
        
        
        if ($request->user()->favorites()->where('event_id', $eventId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Event is already in your favorites'
            ], 400);
        }

        $request->user()->favorites()->attach($eventId);

        return response()->json([
            'success' => true,
            'message' => 'Event added to favorites',
            'data' => $event
        ]);
    }

    /**
     * Remove an event from favorites
     */
    public function destroy(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);
        
        if (!$request->user()->favorites()->where('event_id', $eventId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Event is not in your favorites'
            ], 400);
        }

        $request->user()->favorites()->detach($eventId);

        return response()->json([
            'success' => true,
            'message' => 'Event removed from favorites'
        ]);
    }

    /**
     * Check if an event is favorited by the user
     */
    public function check(Request $request, $eventId)
    {
        $isFavorited = $request->user()
            ->favorites()
            ->where('event_id', $eventId)
            ->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'is_favorited' => $isFavorited
            ]
        ]);
    }
}
