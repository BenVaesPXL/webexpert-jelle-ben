<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        // Haal alle events op, met een count van beschikbare tickets per event
        $events = Event::withCount([
            'tickets as available_tickets' => function ($q) {
                $q->where('available_quantity', '>', 0);
            }
        ])
            ->orderBy('start_date')
            ->get();

        // Geeft een lijst van events terug, gesorteerd op startdatum, met het aantal beschikbare tickets
        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function show($id)
    {
        // Haal het event op, inclusief alle tickets (gesorteerd op prijs)
        $event = Event::with([
            'tickets' => function ($q) {
                $q->orderBy('price');
            }
        ])->findOrFail($id);

        // Controleer of tickets al gekocht kunnen worden
        $ticketsCanBeBought = true;
        if ($event->tickets_available_from && now()->lt($event->tickets_available_from)) {
            $ticketsCanBeBought = false;
        }

        // Geeft event details terug, inclusief tickets en of ze al te koop zijn
        return response()->json([
            'success' => true,
            'data' => [
                'event' => $event,
                'tickets_can_be_bought' => $ticketsCanBeBought,
            ]
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        // ...event creation logic...
        return response()->json([
            'success' => true,
            'message' => 'Event created (stub).'
        ], 201);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, $id)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        // ...event update logic...
        return response()->json([
            'success' => true,
            'message' => 'Event updated (stub).'
        ]);
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy($id)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        // ...event delete logic...
        return response()->json([
            'success' => true,
            'message' => 'Event deleted (stub).'
        ]);
    }
}
