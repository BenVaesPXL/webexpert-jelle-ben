<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        /* $events = Event::withCount([
            'tickets as available_tickets' => function ($q) {
                $q->where('available_quantity', '>', 0);
            }
        ])
            ->orderBy('start_date')
            ->get();*/


        //vervanging want dr zijn nog geen ticket migrations
        $events = Event::orderBy('start_date')->get();


        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /*public function show($id)
    {
        $event = Event::with([
            'tickets' => function ($q) {
                $q->orderBy('price');
            }
        ])->findOrFail($id);

        $ticketsCanBeBought = true;

        if ($event->tickets_available_from && now()->lt($event->tickets_available_from)) {
            $ticketsCanBeBought = false;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'event' => $event,
                'tickets_can_be_bought' => $ticketsCanBeBought,
            ]
        ]);
    }*/


    //tijdelijke vervanging, nog geen tickets
    public function show($id)
    {
        $event = Event::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'event' => $event,
                'tickets_can_be_bought' => false,
            ]
        ]);
    }
}
